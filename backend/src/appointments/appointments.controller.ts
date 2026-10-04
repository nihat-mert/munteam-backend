import { Body, Controller, Get, Post, Req, UseGuards, Patch, Param } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

@Controller('appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get('my')
  findAll(@Req() req: { user: { sub: string } }) {
    return this.appointmentsService.findAll(req.user.sub);
  }

  @Post()
  create(@Req() req: { user: { sub: string } }, @Body() dto: CreateAppointmentDto) {
    return this.appointmentsService.create(req.user.sub, dto);
  }
}

@Controller('admin/appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminAppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  getAll() {
    return this.appointmentsService.getAll();
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.appointmentsService.updateStatus(id, body.status);
  }
}
