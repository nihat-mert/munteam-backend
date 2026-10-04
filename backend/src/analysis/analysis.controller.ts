import { Controller, Get, Post, Req, UseGuards, Body } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('analysis')
@UseGuards(JwtAuthGuard)
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Get('categories')
  async getCategories() {
    return this.analysisService.getCategories();
  }

  @Get('types')
  async getTypes() {
    return this.analysisService.getTypes();
  }

  @Get('my-requests')
  getMyRequests(@Req() req: { user: { sub: string } }) {
    return this.analysisService.getMyRequests(req.user.sub);
  }

  @Post('create-request')
  createRequest(@Req() req: { user: { sub: string } }, @Body() body: any) {
    return this.analysisService.createRequest(req.user.sub, body);
  }
}
