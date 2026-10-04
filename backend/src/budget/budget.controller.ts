import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { BudgetService } from './budget.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('budget')
@UseGuards(JwtAuthGuard)
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Get()
  getProjects(@Req() req: { user: { sub: string } }) {
    return this.budgetService.getProjects(req.user.sub);
  }

  @Get('summary')
  getSummary(@Req() req: { user: { sub: string } }) {
    return this.budgetService.getSummary(req.user.sub);
  }
}
