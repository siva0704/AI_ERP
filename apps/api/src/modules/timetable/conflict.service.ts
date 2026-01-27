
import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ConflictService {
    constructor(private prisma: PrismaService) { }

    /**
     * Standardizes time overlap logic:
     * (StartA < EndB) && (EndA > StartB)
     * 
     * @param tenantId - Organization Scope
     * @param branchId - Branch Scope
     * @param teacherId - Resource 1
     * @param classroomId - Resource 2
     * @param dayOfWeek - Day (MONDAY, TUESDAY...)
     * @param startTime - Minutes from midnight (e.g. 540)
     * @param endTime - Minutes from midnight (e.g. 600)
     */
    async validateSlot(
        tenantId: string,
        branchId: string,
        teacherId: string,
        classroomId: string,
        dayOfWeek: string,
        startTime: number,
        endTime: number
    ): Promise<void> {
        // Query for ANY overlap with Teacher OR Room
        const conflicts = await this.prisma.timetable.findMany({
            where: {
                // tenantId is not in Timetable model, relying on branchId
                branchId,
                dayOfWeek,
                OR: [
                    { teacherId },
                    { classroomId }
                ],
                // Overlap Logic: (StartA < EndB) && (EndA > StartB)
                // We cast to any because Prisma Client types might be stale after Integer migration
                startTime: { lt: endTime } as any,
                endTime: { gt: startTime } as any
            },
            include: {
                teacher: true,
                classroom: true,
                subject: true
            }
        }) as any[]; // Cast result to any[] to avoid property access errors

        if (conflicts.length > 0) {
            const conflict = conflicts[0];
            let reason = 'Unknown Conflict';

            if (conflict.teacherId === teacherId) {
                // Safety check for relations
                const teacherName = conflict.teacher?.first_name || 'Teacher';
                const subjectName = conflict.subject?.name || 'Subject';
                const roomName = conflict.classroom?.name || 'Room';
                reason = `Teacher ${teacherName} is already teaching ${subjectName} in Room ${roomName}`;
            } else if (conflict.classroomId === classroomId) {
                const roomName = conflict.classroom?.name || 'Room';
                const subjectName = conflict.subject?.name || 'Subject';
                reason = `Room ${roomName} is occupied by ${subjectName}`;
            }

            throw new ConflictException({
                message: 'Timetable Conflict Detected',
                details: reason,
                conflictId: conflict.id
            });
        }
    }
}
