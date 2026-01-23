import { Module } from '@nestjs/common';
import { PayrollController } from './payroll.controller';
import { PayrollService } from './payroll.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { GlobalContextModule } from '../../common/context/global-context.module';

@Module({
    imports: [PrismaModule, GlobalContextModule],
    controllers: [PayrollController],
    providers: [PayrollService],
    exports: [PayrollService]
})
export class PayrollModule { }
