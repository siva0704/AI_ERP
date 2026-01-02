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
        // Mock
        if (data.status === 'ABSENT') {
            this.triggerSafetyAlert(data.userId, data.date);
        }
        return {
            id: 'mock-record-1',
            ...data,
            message: 'Attendance marked (MOCK)'
        };
    }

    private async triggerSafetyAlert(userId: string, date: Date) {
        this.logger.warn(`[SAFETY TRIGGER] SMS Sent to Parent (MOCK) for User ${userId}. Absent on ${date.toISOString()}`);
    }

    async getAttendance(userId: string) {
        return [
            { id: '1', userId, status: 'PRESENT', date: new Date(), branchId: 'mock-branch' },
            { id: '2', userId, status: 'ABSENT', date: new Date(Date.now() - 86400000), branchId: 'mock-branch' }
        ];
    }

    async bulkMarkAttendance(items: any[], date: Date, branchId: string) {
        return { count: items.length, message: "Bulk attendance marked (MOCK)" };
    }

    async getAttendanceReport(branchId: string) {
        return [
            { status: 'PRESENT', count: 45 },
            { status: 'ABSENT', count: 5 },
            { status: 'LATE', count: 2 },
            { status: 'EXCUSED', count: 1 }
        ];
    }
}
