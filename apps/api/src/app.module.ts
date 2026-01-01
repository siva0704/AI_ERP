
import { Module } from '@nestjs/common';
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
import { AuditInterceptor } from './common/interceptors/audit.interceptor';

@Module({
  imports: [
    PrismaModule,
    GlobalContextModule,
    AdmissionModule,
    FeesModule,
    AttendanceModule,
    TimetableModule,
    ExamModule,
    LibraryModule,
    TransportModule,
    ReportingModule
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
export class AppModule { }

