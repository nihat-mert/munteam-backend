import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SurveyService {
  constructor(private prisma: PrismaService) {}

  async getMySurveys(userId: string) {
    return this.prisma.survey.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: { userId: string; requestId: string; rating: number; comment?: string }) {
    return this.prisma.survey.create({
      data,
    });
  }

  async getAll() {
    return this.prisma.survey.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
