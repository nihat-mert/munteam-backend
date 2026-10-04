import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalysisService {
  constructor(private prisma: PrismaService) {}

  async getCategories() {
    return this.prisma.analysisCategory.findMany({
      include: {
        analysisTypes: true,
      },
    });
  }

  async getTypes() {
    return this.prisma.analysisType.findMany({
      include: {
        category: true,
      },
    });
  }

  async getMyRequests(userId: string) {
    return this.prisma.analysisRequest.findMany({
      where: { userId },
      include: {
        samples: {
          include: {
            sampleAnalyses: {
              include: {
                analysisType: true,
              },
            },
          },
        },
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createRequest(userId: string, body: any) {
    const { samples, requestType, kullanimAmaci, projeNo, destekAlanKurulus, teslimYontemi, odemeKaynaki } = body;

    const toplamTutar = samples.reduce((total: number, sample: any) => {
      return total + sample.analyses.reduce((sum:number, analysis:any) => {
        let price = analysis.price || 0;
        if (analysis.elements && analysis.elements.length > 0) {
          price += analysis.elements.length * 50;
        }
        if (analysis.numuneHazirlik === 'ISTIYORUM') {
          price += 100;
        }
        return sum + price;
      }, 0);
    }, 0);

    const request = await this.prisma.analysisRequest.create({
      data: {
        userId,
        requestType: requestType || 'ANALIZ_BASVURUSU',
        status: 'TASLAK',
        kullanimAmaci,
        projeNo,
        destekAlanKurulus,
        teslimYontemi,
        odemeKaynaki,
        toplamTutar,
        samples: {
          create: samples.map((sample: any) => ({
            numuneAdi: sample.numuneAdi,
            ambalajSekli: sample.ambalajSekli,
            kartonBoyutu: sample.kartonBoyutu,
            numuneHazirlik: sample.numuneHazirlik,
            baskaSoru: sample.baskaSoru,
            iadeEdilecekMi: sample.iadeEdilecekMi,
            tehlikeliMi: sample.tehlikeliMi,
            sampleAnalyses: {
              create: sample.analyses.map((analysis: any) => ({
                analysisTypeId: analysis.analysisTypeId,
              })),
            },
          })),
        },
      },
      include: {
        samples: {
          include: {
            sampleAnalyses: {
              include: {
                analysisType: true,
              },
            },
          },
        },
        user: true,
      },
    });

    return request;
  }
}
