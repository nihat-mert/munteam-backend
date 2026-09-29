import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async createOrder(userId: string, items: { productId: string; quantity: number }[]) {
    return this.prisma.$transaction(async (tx) => {
      let totalAmount = 0;

      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new BadRequestException(`Product with id ${item.productId} not found`);
        }

        if (product.stock < item.quantity) {
          throw new BadRequestException(`Insufficient stock for product ${product.name}`);
        }

        totalAmount += Number(product.price) * item.quantity;
      }

      const order = await tx.order.create({
        data: {
          userId,
          totalAmount,
          status: 'PENDING',
          items: {
            create: await Promise.all(
              items.map(async (item) => {
                const product = await tx.product.findUnique({
                  where: { id: item.productId },
                });
                if (!product) {
                  throw new BadRequestException(`Product with id ${item.productId} not found`);
                }
                return {
                  productId: item.productId,
                  quantity: item.quantity,
                  priceAtPurchase: product.price,
                };
              }),
            ),
          },
        },
      });

      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return order;
    });
  }

  async findAll(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    return this.prisma.order.findFirst({
      where: { id, userId },
      include: { items: true },
    });
  }
}
