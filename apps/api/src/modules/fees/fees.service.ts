import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GlobalContextService } from '../../common/context/global-context.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FeesService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly context: GlobalContextService,
        private readonly configService: ConfigService
    ) { }

    async createFeeStructure(data: { name: string; amount: number; currency: string }) {
        if (this.configService.get('MOCK_MODE')) {
            return {
                id: 'mock-fee-structure-id',
                name: data.name,
                amount: data.amount,
                currency: data.currency,
                branchId: 'mock-branch-id',
                createdAt: new Date(),
                updatedAt: new Date(),
            }
        }
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
        if (this.configService.get('MOCK_MODE')) {
            return [
                { id: '1', name: 'Annual Tuition', amount: 5000, currency: 'USD', branchId: 'mock-branch-1' },
                { id: '2', name: 'Library Fee', amount: 200, currency: 'USD', branchId: 'mock-branch-1' },
                { id: '3', name: 'Lab Fee', amount: 300, currency: 'USD', branchId: 'mock-branch-1' }
            ];
        }

        const branchId = this.context.branchId || 'default-branch-id';
        return this.prisma.feeStructure.findMany({
            where: { branchId }
        });
    }

    async collectPayment(data: { studentId: string; amount: number; description: string; paymentMethod?: string }) {
        if (this.configService.get('MOCK_MODE')) {
            return {
                id: 'mock-payment-id',
                studentId: data.studentId,
                amount: data.amount,
                description: data.description,
                type: 'PAYMENT',
                status: 'COMPLETED',
                createdAt: new Date()
            }
        }

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
        if (this.configService.get('MOCK_MODE')) {
            return {
                balance: 1500,
                history: [
                    { id: '1', type: 'DUE', amount: 2000, description: 'Tuition Fee', createdAt: new Date() },
                    { id: '2', type: 'PAYMENT', amount: 500, description: 'Partial Payment', createdAt: new Date() }
                ]
            };
        }

        const ledgers = await this.prisma.feeLedger.findMany({
            where: { studentId, deletedAt: null },
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
