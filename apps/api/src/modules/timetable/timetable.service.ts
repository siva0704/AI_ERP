import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConflictValidatorService } from './conflict-validator.service';

@Injectable()
export class TimetableService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly validator: ConflictValidatorService
    ) { }

    async createSession(data: any) {
        // 1. Validate
        await this.validator.validateSession({
            branchId: data.branchId,
            teacherId: data.teacherId,
            classroomId: data.classroomId,
            startTime: new Date(data.startTime),
            endTime: new Date(data.endTime)
        });

        // 2. Save
        return this.prisma.timetable.create({
            data: {
                branchId: data.branchId,
                subjectId: data.subjectId,
                teacherId: data.teacherId,
                classroomId: data.classroomId,
                dayOfWeek: data.dayOfWeek,
                startTime: new Date(data.startTime),
                endTime: new Date(data.endTime)
            }
        });
    }

    async getMyTimetable(userId: string) {
        return this.prisma.timetable.findMany({
            where: { teacherId: userId },
            include: { subject: true, classroom: true }
        });
    }
}
