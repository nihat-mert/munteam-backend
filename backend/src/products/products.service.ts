import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count(),
    ]);

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    return this.prisma.product.findUnique({ where: { id } });
  }

  async create(data: { name: string; atomicNumber: number; description: string; price: number; stock: number }) {
    return this.prisma.product.create({
      data: {
        ...data,
        price: data.price,
      },
    });
  }

  async update(id: string, data: { name?: string; atomicNumber?: number; description?: string; price?: number; stock?: number }) {
    return this.prisma.product.update({
      where: { id },
      data: {
        ...data,
        price: data.price,
      },
    });
  }

  async delete(id: string) {
    return this.prisma.product.delete({ where: { id } });
  }
}
