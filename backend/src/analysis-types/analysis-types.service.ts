import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalysisTypesService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    return this.prisma.analysisType.findMany({
      include: {
        category: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async getById(id: string) {
    return this.prisma.analysisType.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });
  }

  async create(data: { name: string; categoryId: string; price: number }) {
    return this.prisma.analysisType.create({
      data,
      include: {
        category: true,
      },
    });
  }

  async update(id: string, data: { name?: string; price?: number }) {
    return this.prisma.analysisType.update({
      where: { id },
      data,
      include: {
        category: true,
      },
    });
  }

  async delete(id: string) {
    return this.prisma.analysisType.delete({
      where: { id },
    });
  }
}
