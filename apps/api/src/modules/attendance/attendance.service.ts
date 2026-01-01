import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AttendanceService {
    private readonly logger = new Logger(AttendanceService.name);

    constructor(private readonly prisma: PrismaService) { }

    async markAttendance(data: {
        userId: string;
        branchId: string;
        status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
        date: Date;
        subjectId?: string;
    }) {
        // 1. Save Record
        const record = await this.prisma.attendanceRecord.create({
            data: {
                userId: data.userId,
                branchId: data.branchId,
                status: data.status,
                date: data.date,
                subjectId: data.subjectId,
            },
        });

        // 2. Safety Trigger
        if (data.status === 'ABSENT') {
            this.triggerSafetyAlert(data.userId, data.date);
        }

        return record;
    }

    private async triggerSafetyAlert(userId: string, date: Date) {
        // In a real system, this would push to a Redis Queue (BullMQ)
        // For MVP, we simulate the event processing
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { studentProfile: true }
        });

        if (user?.studentProfile) {
            this.logger.warn(`[SAFETY TRIGGER] SMS Sent to Parent of ${user.studentProfile.firstName}: Your ward is absent today (${date.toISOString().split('T')[0]}).`);
        }
    }

    async getAttendance(userId: string) {
        return this.prisma.attendanceRecord.findMany({
            where: { userId },
            orderBy: { date: 'desc' }
        });
    }

    async bulkMarkAttendance(items: { userId: string; status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'; subjectId?: string }[], date: Date, branchId: string) {
        // Prepare data for createMany
        const records = items.map(item => ({
            userId: item.userId,
            branchId,
            status: item.status,
            date,
            subjectId: item.subjectId,
        }));

        // createMany is faster
        return this.prisma.attendanceRecord.createMany({
            data: records,
            skipDuplicates: true, // Safety
        });
    }
    async getAttendanceReport(branchId: string) {
        // Group by Status
        const stats = await this.prisma.attendanceRecord.groupBy({
            by: ['status'],
            where: { branchId },
            _count: {
                status: true,
            },
        });

        return stats.map(s => ({
            status: s.status,
            count: s._count.status
        }));
    }
}
