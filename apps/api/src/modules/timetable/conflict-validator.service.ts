import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ConflictValidatorService {
    constructor(private readonly prisma: PrismaService) { }

    async validateSession(data: {
        branchId: string;
        teacherId: string;
        classroomId: string;
        startTime: Date;
        endTime: Date;
        sessionId?: string; // For updates
    }) {
        // Check 1: Is Teacher Busy?
        const teacherConflict = await this.prisma.timetable.findFirst({
            where: {
                branchId: data.branchId,
                teacherId: data.teacherId,
                // Overlap Logic: (StartA < EndB) AND (EndA > StartB)
                startTime: { lt: data.endTime },
                endTime: { gt: data.startTime },
                NOT: data.sessionId ? { id: data.sessionId } : undefined
            }
        });

        if (teacherConflict) {
            throw new BadRequestException(`Teacher is already booked from ${teacherConflict.startTime.toISOString()}`);
        }

        // Check 2: Is Room Occupied?
        const roomConflict = await this.prisma.timetable.findFirst({
            where: {
                branchId: data.branchId,
                classroomId: data.classroomId,
                startTime: { lt: data.endTime },
                endTime: { gt: data.startTime },
                NOT: data.sessionId ? { id: data.sessionId } : undefined
            }
        });

        if (roomConflict) {
            throw new BadRequestException(`Room ${data.classroomId} is already occupied.`);
        }

        return true;
    }
}
