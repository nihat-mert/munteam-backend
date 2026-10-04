import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AnalysisTypesService } from './analysis-types.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('analysis-types')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AnalysisTypesController {
  constructor(private readonly analysisTypesService: AnalysisTypesService) {}

  @Get()
  getAll() {
    return this.analysisTypesService.getAll();
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.analysisTypesService.getById(id);
  }

  @Post()
  create(@Body() body: { name: string; categoryId: string; price: number }) {
    return this.analysisTypesService.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: { name?: string; price?: number }) {
    return this.analysisTypesService.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.analysisTypesService.delete(id);
  }
}
