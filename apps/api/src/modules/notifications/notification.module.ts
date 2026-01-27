import { Module, Global } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { NotificationService } from './notification.service';
import { ConsoleLogProvider } from './notification.provider';
import { PrismaModule } from '../../prisma/prisma.module';
import { FeePaymentListener } from './listeners/fee-payment.listener';
import { PayrollListener } from './listeners/payroll.listener';

import { NotificationController } from './notification.controller';

@Global()
@Module({
    imports: [
        EventEmitterModule.forRoot(),
        PrismaModule
    ],
    controllers: [NotificationController],
    providers: [
        NotificationService,
        FeePaymentListener,
        PayrollListener,
        {
            provide: 'NOTIFICATION_PROVIDER',
            useClass: ConsoleLogProvider
        }
    ],
    exports: [NotificationService]
})
export class NotificationModule { }
