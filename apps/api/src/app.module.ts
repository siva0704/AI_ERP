
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { GlobalContextModule } from './common/context/global-context.module';
import { AdmissionModule } from './modules/admission/admission.module';
import { FeesModule } from './modules/fees/fees.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { TimetableModule } from './modules/timetable/timetable.module';
import { ExamModule } from './modules/exam/exam.module';
import { LibraryModule } from './modules/library/library.module';
import { TransportModule } from './modules/transport/transport.module';
import { ReportingModule } from './modules/reporting/reporting.module';
import { StaffModule } from './modules/staff/staff.module';
import { PayrollModule } from './modules/payroll/payroll.module';
import { NotificationModule } from './modules/notifications/notification.module';
import { AssistantModule } from './modules/assistant/assistant.module';
import { DocumentModule } from './modules/documents/document.module';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { ContextMiddleware } from './common/middleware/context.middleware';

import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        OPENAI_API_KEY: Joi.string().required(),
        PORT: Joi.number().default(3001),
        MOCK_MODE: Joi.boolean().default(true),
      }),
    }),
    PrismaModule,
    GlobalContextModule,
    AdmissionModule,
    FeesModule,
    AttendanceModule,
    TimetableModule,
    ExamModule,
    LibraryModule,
    TransportModule,
    ReportingModule,
    StaffModule,
    PayrollModule,
    NotificationModule,
    AssistantModule,
    DocumentModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ContextMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}

