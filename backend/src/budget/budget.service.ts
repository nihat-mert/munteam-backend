import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class BudgetService {
  constructor(private prisma: PrismaService) {}

  async getProjects(userId: string) {
    let projects = await this.prisma.budgetProject.findMany({
      where: { userId },
      include: {
        payments: {
          orderBy: { paymentDate: 'desc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (projects.length === 0) {
      const [analysisSum, orderSum] = await Promise.all([
        this.prisma.analysisRequest.aggregate({
          where: { userId },
          _sum: { toplamTutar: true },
        }),
        this.prisma.order.aggregate({
          where: { userId },
          _sum: { totalAmount: true },
        }),
      ]);

      await this.prisma.budgetProject.createMany({
        data: [
          {
            userId,
            name: 'SEM / Analiz Projesi',
            limitAmount: new Prisma.Decimal(50000),
            spentAmount: analysisSum._sum.toplamTutar ?? new Prisma.Decimal(0),
          },
          {
            userId,
            name: 'Katalog Siparişleri',
            limitAmount: new Prisma.Decimal(25000),
            spentAmount: orderSum._sum.totalAmount ?? new Prisma.Decimal(0),
          },
          {
            userId,
            name: 'UV Cihaz Kullanımı',
            limitAmount: new Prisma.Decimal(15000),
            spentAmount: new Prisma.Decimal(0),
          },
        ],
      });

      projects = await this.prisma.budgetProject.findMany({
        where: { userId },
        include: {
          payments: {
            orderBy: { paymentDate: 'desc' },
          },
        },
        orderBy: { createdAt: 'asc' },
      });
    }

    return projects.map((project) => {
      const limit = Number(project.limitAmount);
      const spent = Number(project.spentAmount);
      const remaining = Math.max(0, limit - spent);
      const percent = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
      return {
        id: project.id,
        name: project.name,
        limitAmount: limit,
        spentAmount: spent,
        remaining,
        percent,
        payments: project.payments.map((payment) => ({
          id: payment.id,
          dekontNo: payment.dekontNo,
          amount: Number(payment.amount),
          paymentDate: payment.paymentDate.toISOString(),
        })),
      };
    });
  }

  async getSummary(userId: string) {
    const [analysisSum, orderSum, projectSum] = await Promise.all([
      this.prisma.analysisRequest.aggregate({
        where: { userId },
        _sum: { toplamTutar: true },
        _count: true,
      }),
      this.prisma.order.aggregate({
        where: { userId },
        _sum: { totalAmount: true },
        _count: true,
      }),
      this.prisma.budgetProject.aggregate({
        where: { userId },
        _sum: { limitAmount: true, spentAmount: true },
      }),
    ]);

    const totalSpent = Number(analysisSum._sum.toplamTutar || 0) + Number(orderSum._sum.totalAmount || 0);
    const totalLimit = Number(projectSum._sum.limitAmount || 0);
    const pendingPayments = Number(analysisSum._sum.toplamTutar || 0) - Number(projectSum._sum.spentAmount || 0);

    return {
      totalSpent,
      totalLimit,
      pendingPayments: Math.max(0, pendingPayments),
      approvedBudget: totalLimit,
      analysisCount: analysisSum._count,
      orderCount: orderSum._count,
    };
  }
}
