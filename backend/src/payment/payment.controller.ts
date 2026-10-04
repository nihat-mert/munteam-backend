import { Controller, Get, Post, Req, UseGuards, Param, Body } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get('my')
  getMyPayments(@Req() req: { user: { sub: string } }) {
    return this.paymentService.getMyPayments(req.user.sub);
  }

  @Post(':requestId/pay')
  payRequest(@Param('requestId') requestId: string, @Body() body: { cardNumber: string; expiry: string; cvv: string }) {
    return this.paymentService.payRequest(requestId);
  }
}
