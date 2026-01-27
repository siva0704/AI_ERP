import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
    constructor(
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService,
        private readonly healthService: HealthService
    ) { }

    @Post('cleanup')
    @UseGuards() // Protect this in prod!
    async triggerCleanup() {
        const count = await this.healthService.cleanupOldLogs();
        return { message: 'Cleanup complete', deleted: count };
    }


    @Get('stats')
    async getStats() {
        const start = Date.now();

        // 1. DB Latency Check
        try {
            await this.prisma.$queryRaw`SELECT 1`;
        } catch (e) {
            return { status: 'error', message: 'Database unreachable' };
        }
        const dbLatency = Date.now() - start;

        // 2. Storage Count (Approximation via DB for now, or use MinIO client if available)
        // For MVP phase 24, we count Document records
        const documentCount = await this.prisma.document.count();
        const auditLogCount = await this.prisma.auditLog.count();

        // 3. System Info
        const memoryUsage = process.memoryUsage();

        return {
            status: 'healthy',
            timestamp: new Date(),
            metrics: {
                dbLatency: `${dbLatency}ms`,
                storageObjects: documentCount,
                auditEvents: auditLogCount,
                memory: {
                    rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
                    heapOriginal: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`
                },
                storageDriver: this.configService.get('STORAGE_DRIVER') || 'local'
            }
        };
    }

    @Get('audit-feed')
    async getAuditFeed() {
        // Return last 20 audit logs for the live feed
        return await this.prisma.auditLog.findMany({
            take: 20,
            orderBy: { createdAt: 'desc' },
            include: {
                tenant: {
                    select: { name: true }
                }
            }
        });
    }

    @Get('audit-test') // Using GET for ease, but Interceptor monitors POST/PUT/DELETE. 
    // We must use POST.
    @UseGuards() // Open guard
    async getTestInfo() {
        return { message: 'Use POST /api/health/audit-test to trigger log' };
    }

    @Post('audit-test')
    async triggerAudit(@Body() body: any) {
        return { message: 'Audit Test Executed', received: body };
    }
}
