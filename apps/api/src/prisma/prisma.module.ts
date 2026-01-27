import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

import { GlobalContextModule } from '../common/context/global-context.module';
import { GlobalContextService } from '../common/context/global-context.service';
import { MockPrismaService } from './mock-prisma.service';

@Global()
@Module({
    imports: [GlobalContextModule],
    providers: [
        {
            provide: PrismaService,
            useFactory: () => {
                console.log('DEBUG: MOCK_MODE is:', process.env.MOCK_MODE);
                if (process.env.MOCK_MODE === 'true') {
                    console.log('DEBUG: RETURNING MOCK PRISMA SERVICE');
                    return new MockPrismaService();
                }
                console.log('DEBUG: RETURNING REAL PRISMA SERVICE');
                return new PrismaService(new GlobalContextService());
            },
            inject: [],
        },
        MockPrismaService, // Register specific mock class if needed
    ],
    exports: [PrismaService],
})
export class PrismaModule { }
