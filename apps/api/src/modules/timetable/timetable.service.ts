import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConflictService } from './conflict.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TimetableService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly validator: ConflictService,
        private readonly configService: ConfigService
    ) { }

    async createSession(tenantId: string, branchId: string, data: any) {
        // Data expected: { teacherId, classroomId, subjectId, dayOfWeek, startTime: number, endTime: number }

        // 1. Validate Overlaps
        await this.validator.validateSlot(
            tenantId,
            branchId,
            data.teacherId,
            data.classroomId,
            data.dayOfWeek,
            data.startTime,
            data.endTime
        );

        // 2. Save
        return this.prisma.timetable.create({
            data: {
                branchId,
                subjectId: data.subjectId,
                teacherId: data.teacherId,
                classroomId: data.classroomId,
                dayOfWeek: data.dayOfWeek,
                startTime: data.startTime, // Int
                endTime: data.endTime,     // Int
                // Schema doesn't have tenantId on Timetable table? 
                // Double check schema. Schema has branchId. 
                // If context requires tenantId, we usually rely on branch->tenant relation or add it.
                // For now, based on schema view, only branchId is stored.
            }
        });
    }

    async getBranchTimetable(branchId: string) {
        if (this.configService.get('MOCK_MODE')) {
            return [
                {
                    id: 'mock-session-1',
                    dayOfWeek: 'MONDAY',
                    startTime: 540, // 9:00 AM
                    endTime: 600,   // 10:00 AM
                    subject: { name: 'Mathematics' },
                    classroom: { name: '10-A' },
                    teacher: { firstName: 'John', lastName: 'Doe' }
                },
                {
                    id: 'mock-session-2',
                    dayOfWeek: 'TUESDAY',
                    startTime: 600, // 10:00 AM
                    endTime: 660,   // 11:00 AM
                    subject: { name: 'Physics' },
                    classroom: { name: 'Lab 1' },
                    teacher: { firstName: 'Jane', lastName: 'Smith' }
                }
            ];
        }

        return this.prisma.timetable.findMany({
            where: { branchId },
            include: { subject: true, classroom: true, teacher: true }
        });
    }

    async getMyTimetable(userId: string) {
        return this.prisma.timetable.findMany({
            where: { teacherId: userId },
            include: { subject: true, classroom: true }
        });
    }
}
