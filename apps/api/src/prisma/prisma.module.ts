import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

import { GlobalContextModule } from '../common/context/global-context.module';

@Global()
@Module({
    imports: [GlobalContextModule],
    providers: [PrismaService],
    exports: [PrismaService],
})
export class PrismaModule { }
