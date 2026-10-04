import { Module } from '@nestjs/common';
import { AnalysisTypesController } from './analysis-types.controller';
import { AnalysisTypesService } from './analysis-types.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [AnalysisTypesController],
  providers: [AnalysisTypesService, PrismaService],
})
export class AnalysisTypesModule {}
