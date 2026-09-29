import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  createOrder(@Req() req: any, @Body() body: { items: { productId: string; quantity: number }[] }) {
    return this.ordersService.createOrder(req.user.sub, body.items);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.ordersService.findAll(req.user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.ordersService.findOne(id, req.user.sub);
  }
}
