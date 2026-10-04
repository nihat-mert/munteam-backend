import { Module, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma/prisma.service';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { AdminModule } from './admin/admin.module';
import { AnalysisModule } from './analysis/analysis.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { BudgetModule } from './budget/budget.module';
import { PaymentModule } from './payment/payment.module';
import { AnalysisTypesModule } from './analysis-types/analysis-types.module';
import { SurveyModule } from './survey/survey.module';
import * as bcrypt from 'bcrypt';

@Module({
  imports: [
    AuthModule,
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10000,
    }]),
    ProductsModule,
    OrdersModule,
    AdminModule,
    AnalysisModule,
    AppointmentsModule,
    BudgetModule,
    PaymentModule,
    AnalysisTypesModule,
    SurveyModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    // Ensure admin user exists with correct role
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    await this.prisma.user.upsert({
      where: { email: 'admin@bumlab.com.tr' },
      update: { role: 'ADMIN' },
      create: {
        email: 'admin@bumlab.com.tr',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });
    
    console.log('Admin user ensured: admin@bumlab.com.tr');
  }
}
