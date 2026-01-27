import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class HealthService {
    private readonly logger = new Logger(HealthService.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Deletes audit logs older than the specified retention period (days).
     * Recommended: Run this via Cron every night.
     */
    async cleanupOldLogs(retentionDays: number = 90) {
        const thresholdDate = new Date();
        thresholdDate.setDate(thresholdDate.getDate() - retentionDays);

        try {
            const result = await this.prisma.auditLog.deleteMany({
                where: {
                    createdAt: {
                        lt: thresholdDate
                    }
                }
            });
            this.logger.log(`Cleanup Task: Deleted ${result.count} audit logs older than ${retentionDays} days.`);
            return result.count;
        } catch (error) {
            this.logger.error('Cleanup Task Failed', error);
            throw error;
        }
    }
}
