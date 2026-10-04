import { Module } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController, AdminAppointmentsController } from './appointments.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [AppointmentsController, AdminAppointmentsController],
  providers: [AppointmentsService, PrismaService],
})
export class AppointmentsModule {}
