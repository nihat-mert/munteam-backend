import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  async getMyPayments(userId: string) {
    const requests = await this.prisma.analysisRequest.findMany({
      where: { userId },
      include: {
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return requests.map((request) => ({
      id: request.id,
      teklifNo: request.projeNo || request.id.slice(0, 8).toUpperCase(),
      tarih: request.createdAt,
      tutar: request.toplamTutar,
      durum: request.paymentStatus === 'ODENDI' ? 'Ödendi' : 'Bekliyor',
    }));
  }

  async payRequest(requestId: string) {
    return this.prisma.analysisRequest.update({
      where: { id: requestId },
      data: { paymentStatus: 'ODENDI' },
    });
  }
}
