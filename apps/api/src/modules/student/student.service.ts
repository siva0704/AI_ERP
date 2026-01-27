
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StudentService {
    constructor(private prisma: PrismaService) { }

    async findOne(id: string) {
        const student = await this.prisma.studentProfile.findFirst({
            where: { id, deletedAt: null },
            include: {
                user: {
                    include: {
                        documents: true,
                        attendanceRecords: { take: 10, orderBy: { date: 'desc' } }
                    }
                },
                branch: true,
                feeLedgers: true,
                // attendanceRecords removed from here
                examResults: { take: 5, orderBy: { createdAt: 'desc' }, include: { exam: true } }
            }
        });

        if (!student) throw new NotFoundException(`Student with ID ${id} not found`);
        return student;
    }

    async remove(id: string) {
        await this.findOne(id); // Ensure exists and not already deleted
        return this.prisma.studentProfile.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
    }
}
