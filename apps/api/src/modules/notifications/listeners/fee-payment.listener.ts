import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationService } from '../notification.service';

@Injectable()
export class FeePaymentListener {
    constructor(private readonly notificationService: NotificationService) { }

    @OnEvent('fee.collected')
    async handleFeeCollectedEvent(payload: { email: string, amount: number, transactionId: string }) {
        console.log('[Listener] Fee Payment Event Received');
        const subject = `Payment Receipt - ${payload.transactionId}`;
        const body = `Dear Parent, \n\nWe have received a payment of $${payload.amount}. \nTransaction ID: ${payload.transactionId}\n\nThank you.`;

        await this.notificationService.sendEmail(payload.email, subject, body);
    }
}
