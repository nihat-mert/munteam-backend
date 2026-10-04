import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.appointment.findMany({
      where: { userId },
      orderBy: { baslangicTarihi: 'desc' },
    });
  }

  async create(userId: string, dto: CreateAppointmentDto) {
    const start = new Date(dto.baslangicTarihi);
    const end = new Date(dto.bitisTarihi);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new BadRequestException('Geçerli bir tarih/saat aralığı girin');
    }
    if (end <= start) {
      throw new BadRequestException('Bitiş tarihi, başlangıçtan sonra olmalıdır');
    }

    const conflict = await this.prisma.appointment.findFirst({
      where: {
        cihazAdi: dto.cihazAdi,
        status: { in: ['BEKLIYOR', 'ONAYLANDI'] },
        AND: [{ baslangicTarihi: { lt: end } }, { bitisTarihi: { gt: start } }],
      },
    });

    if (conflict) {
      throw new ConflictException(
        `${dto.cihazAdi} seçilen tarih ve saat aralığında dolu. Lütfen başka bir saat seçin.`,
      );
    }

    return this.prisma.appointment.create({
      data: {
        userId,
        cihazAdi: dto.cihazAdi,
        baslangicTarihi: start,
        bitisTarihi: end,
        status: 'BEKLIYOR',
        aciklama: dto.aciklama?.trim() || null,
      },
    });
  }

  async getAll() {
    return this.prisma.appointment.findMany({
      include: {
        user: true,
      },
      orderBy: { baslangicTarihi: 'desc' },
    });
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.appointment.update({
      where: { id },
      data: { status },
    });
  }
}
