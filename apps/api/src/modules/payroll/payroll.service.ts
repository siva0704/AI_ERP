import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GlobalContextService } from '../../common/context/global-context.service';
import { DocumentGeneratorService } from '../../common/services/document-generator.service';

@Injectable()
export class PayrollService {
    constructor(
        private prisma: PrismaService,
        private context: GlobalContextService,
        private docGenerator: DocumentGeneratorService
    ) { }

    async calculateMonthlySalary(staffId: string) {
        const branchId = this.context.branchId;

        // 1. Get Staff Profile & Base Pay
        const staff = await this.prisma.staffProfile.findUnique({
            where: { id: staffId }
        });

        if (!staff || staff.branchId !== branchId) {
            throw new BadRequestException('Staff not found');
        }

        const baseSalary = Number(staff.baseSalary);

        // 2. Calculate Absent Days (LOP) for current month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const absentCount = await this.prisma.attendanceRecord.count({
            where: {
                userId: staff.userId,
                status: 'ABSENT',
                date: {
                    gte: startOfMonth
                }
            }
        });

        // 3. Logic: 1 Day Loss per Absent (Simple)
        const dailyRate = baseSalary / 30; // Standard 30 days
        const deduction = absentCount * dailyRate;

        const netSalary = Math.max(0, baseSalary - deduction);

        // 4. Create Ledger Entry
        return await this.prisma.payrollLedger.create({
            data: {
                staffId: staff.id,
                branchId: branchId,
                month: startOfMonth,
                baseSalary: baseSalary,
                totalDeductions: deduction,
                netSalary: netSalary,
                status: 'GENERATED',
                overrideReason: absentCount > 0 ? `${absentCount} Days Absent` : null
            }
        });
    }

    async getPayrollLedger(monthStr?: string) {
        const branchId = this.context.branchId;
        return await this.prisma.payrollLedger.findMany({
            where: { branchId },
            include: {
                staff: {
                    include: {
                        user: true
                    }
                }
            },
            orderBy: { generatedAt: 'desc' }
        });
    }

    async generatePayslip(ledgerId: string) {
        const branchId = this.context.branchId;
        const ledger = await this.prisma.payrollLedger.findUnique({
            where: { id: ledgerId },
            include: {
                staff: {
                    include: {
                        user: true
                    }
                }
            }
        });

        if (!ledger || ledger.branchId !== branchId) {
            throw new BadRequestException('Payslip not found');
        }

        const pdfBuffer = await this.docGenerator.generatePayslip({
            branchId,
            month: ledger.month,
            staffName: `${ledger.staff.user.email} (ID: ${ledger.staff.userId})`, // MVP Name
            designation: ledger.staff.designation,
            baseSalary: Number(ledger.baseSalary),
            totalDeductions: Number(ledger.totalDeductions),
            netSalary: Number(ledger.netSalary)
        });

        return {
            filename: `Payslip-${ledger.staffId}-${ledger.month.toISOString().slice(0, 7)}.pdf`,
            buffer: pdfBuffer
        };
    }
}
