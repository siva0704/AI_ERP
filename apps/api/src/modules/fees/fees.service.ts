import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GlobalContextService } from '../../common/context/global-context.service';

@Injectable()
export class FeesService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly context: GlobalContextService,
    ) { }

    async createFeeStructure(data: { name: string; amount: number; currency: string }) {
        const branchId = this.context.branchId || 'default-branch-id';
        return this.prisma.feeStructure.create({
            data: {
                name: data.name,
                amount: data.amount,
                currency: data.currency,
                branchId,
            }
        });
    }

    async getFeeStructures() {
        const branchId = this.context.branchId || 'default-branch-id';
        return this.prisma.feeStructure.findMany({
            where: { branchId }
        });
    }

    async collectPayment(data: { studentId: string; amount: number; description: string; paymentMethod?: string }) {
        const branchId = this.context.branchId || 'default-branch-id';

        // Create a Ledger Entry for Payment
        // In a real system, we might match this against DUEs.
        // For MVP, we just record the payment (Credit)
        return this.prisma.feeLedger.create({
            data: {
                studentId: data.studentId,
                branchId,
                description: data.description,
                amount: data.amount,
                type: 'PAYMENT', // Enum in Schema
                status: 'COMPLETED',
            }
        });
    }

    async getStudentDues(studentId: string) {
        const ledgers = await this.prisma.feeLedger.findMany({
            where: { studentId },
            orderBy: { createdAt: 'desc' }
        });

        // Calculate Balance
        // If Type is DUE, add. If PAYMENT, subtract.
        let balance = 0;
        for (const record of ledgers) {
            if (record.type === 'DUE') {
                balance += Number(record.amount);
            } else if (record.type === 'PAYMENT') {
                balance -= Number(record.amount);
            }
        }

        return {
            balance,
            history: ledgers
        };
    }
}
