import { Module } from '@nestjs/common';
import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { GlobalContextModule } from '../../common/context/global-context.module';

@Module({
    imports: [PrismaModule, GlobalContextModule],
    controllers: [StaffController],
    providers: [StaffService],
    exports: [StaffService]
})
export class StaffModule { }
