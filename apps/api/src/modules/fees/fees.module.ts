import { Module } from '@nestjs/common';
import { FeesController } from './fees.controller';
import { FeesService } from './fees.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { GlobalContextModule } from '../../common/context/global-context.module';

@Module({
    imports: [PrismaModule, GlobalContextModule],
    controllers: [FeesController],
    providers: [FeesService],
    exports: [FeesService],
})
export class FeesModule { }
