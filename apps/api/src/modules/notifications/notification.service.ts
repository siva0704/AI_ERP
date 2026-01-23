import { Injectable, Inject } from '@nestjs/common';
import { NotificationProvider } from './notification.provider';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificationService {
    constructor(
        @Inject('NOTIFICATION_PROVIDER') private readonly provider: any,
        private readonly prisma: PrismaService
    ) { }

    async sendEmail(to: string, subject: string, body: string) {
        return this.provider.send(to, subject, body);
    }

    async broadcast(role: string, branchId: string, subject: string, message: string) {
        // Fetch users by role
        const users = await this.prisma.user.findMany({
            where: { role: role as any, branchId }
        });

        console.log(`[Notification] Broadcasting to ${users.length} users with role ${role}...`);

        // In a real system, queue this. For now, iterate async but don't await all blocking
        for (const user of users) {
            // Fire and forget individually to avoid holding up the loop too much in this simple implementations
            // For better perf, use Promise.all with chunks
            this.provider.send(user.email, subject, message).catch((e: any) => console.error(e));
        }

        return { count: users.length };
    }
}
