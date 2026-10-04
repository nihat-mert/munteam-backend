import { Module } from '@nestjs/common';
import { SurveyController, AdminSurveyController } from './survey.controller';
import { SurveyService } from './survey.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [SurveyController, AdminSurveyController],
  providers: [SurveyService, PrismaService],
})
export class SurveyModule {}
