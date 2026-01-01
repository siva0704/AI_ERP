import { Module } from '@nestjs/common';
import { ReportingController } from './reporting.controller';
import { ReportingService } from './reporting.service';
import { PrismaModule } from '../../prisma/prisma.module'; // Adjust path if needed
import { GlobalContextModule } from '../../common/context/global-context.module';

@Module({
    imports: [PrismaModule, GlobalContextModule],
    controllers: [ReportingController],
    providers: [ReportingService],
    exports: [ReportingService]
})
export class ReportingModule { }
