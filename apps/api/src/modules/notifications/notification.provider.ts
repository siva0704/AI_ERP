import { Injectable, Logger } from '@nestjs/common';

export interface NotificationProvider {
    send(to: string, subject: string, body: string): Promise<void>;
}

@Injectable()
export class ConsoleLogProvider implements NotificationProvider {
    private readonly logger = new Logger(ConsoleLogProvider.name);

    async send(to: string, subject: string, body: string): Promise<void> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 100));

        this.logger.log(`[Notification] 📧 Sending Email to: ${to}`);
        this.logger.log(`[Notification] Subject: ${subject}`);
        this.logger.log(`[Notification] Body: ${body}`);
    }
}
