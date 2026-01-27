import { Injectable, ForbiddenException, HttpException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ExamService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService
    ) { }

    async getStudentMarksheet(studentId: string, branchId: string) {
        if (this.configService.get('MOCK_MODE')) {
            return [
                {
                    id: 'mock-result-1',
                    marks: 85,
                    exam: { name: 'Midterm Math', date: new Date() }
                },
                {
                    id: 'mock-result-2',
                    marks: 90,
                    exam: { name: 'Midterm Physics', date: new Date() }
                }
            ];
        }

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

        // Grace Threshold: Don't block for minor amounts (e.g. < $50)
        const THRESHOLD = Number(process.env.FEE_GATE_THRESHOLD) || 50;

        if (pendingAmount > THRESHOLD) {
            throw new HttpException(`Marksheet blocked due to outstanding fees: $${pendingAmount}`, 402);
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
        if (this.configService.get('MOCK_MODE')) {
            return {
                id: 'mock-result-new',
                ...data
            };
        }

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
