import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ExamService {
    constructor(private readonly prisma: PrismaService) { }

    async getStudentMarksheet(studentId: string, branchId: string) {
        // 1. Fee Lock Logic
        const feesDue = await this.prisma.feeLedger.aggregate({
            where: {
                studentId,
                branchId,
                status: 'PENDING',
                type: 'DUE'
            },
            _sum: { amount: true }
        });

        const pendingAmount = Number(feesDue._sum.amount || 0);

        if (pendingAmount > 0) {
            throw new ForbiddenException(`Marksheet blocked due to outstanding fees: $${pendingAmount}`);
        }

        // 2. Fetch Results
        return this.prisma.examResult.findMany({
            where: {
                studentId,
                exam: { branchId } // Filter by exam's branch since results are tied to exam
            },
            include: {
                exam: true
            }
        });
    }

    async submitMarks(data: {
        examId: string;
        studentId: string;
        marks: number;
        branchId: string;
    }) {
        // Upsert logic
        // Check if result exists
        const existing = await this.prisma.examResult.findFirst({
            where: {
                examId: data.examId,
                studentId: data.studentId
            }
        });

        if (existing) {
            return this.prisma.examResult.update({
                where: { id: existing.id },
                data: { marks: data.marks }
            });
        }

        return this.prisma.examResult.create({
            data: {
                examId: data.examId,
                studentId: data.studentId,
                // branchId is unused in create? No, checked schema: ExamResult has branchId column.
                // If typings are old, casting as any fixes build for now.
                branchId: data.branchId,
                marks: data.marks
            } as any
        });
    }
}
