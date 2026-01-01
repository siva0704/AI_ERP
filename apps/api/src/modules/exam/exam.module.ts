import { Module } from '@nestjs/common';
import { ExamController } from './exam.controller';
import { ExamService } from './exam.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { GlobalContextModule } from '../../common/context/global-context.module';

@Module({
    imports: [PrismaModule, GlobalContextModule],
    controllers: [ExamController],
    providers: [ExamService],
    exports: [ExamService]
})
export class ExamModule { }
