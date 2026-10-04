import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { SurveyService } from './survey.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('surveys')
@UseGuards(JwtAuthGuard)
export class SurveyController {
  constructor(private readonly surveyService: SurveyService) {}

  @Get('my')
  getMySurveys(@Request() req: any) {
    return this.surveyService.getMySurveys(req.user.id);
  }

  @Post()
  create(@Request() req: any, @Body() body: { requestId: string; rating: number; comment?: string }) {
    return this.surveyService.create({
      userId: req.user.id,
      ...body,
    });
  }
}

@Controller('admin/surveys')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminSurveyController {
  constructor(private readonly surveyService: SurveyService) {}

  @Get()
  getAll() {
    return this.surveyService.getAll();
  }
}
