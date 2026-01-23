import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class PayrollService {
    constructor(
        private prisma: PrismaService,
        private eventEmitter: EventEmitter2
    ) { }

    async getPayrollRuns(branchId: string) {
        return this.prisma.payrollRun.findMany({
            where: { branchId },
            orderBy: { month: 'desc' }
        });
    }

    async getRunDetails(runId: string, branchId: string) {
        return this.prisma.payrollRun.findFirst({
            where: { id: runId, branchId },
            include: { ledgers: { include: { staff: { include: { user: true } } } } }
        });
    }

    async previewRun(branchId: string, monthStr: string) {
        // monthStr format "YYYY-MM-DD" (First day of month)
        const monthDate = new Date(monthStr);
        if (isNaN(monthDate.getTime())) throw new BadRequestException('Invalid Date');

        // Check if run already exists
        const existingRun = await this.prisma.payrollRun.findFirst({
            where: { branchId, month: monthDate }
        });
        if (existingRun && existingRun.status === 'COMMITTED') {
            throw new BadRequestException('Payroll already committed for this month.');
        }

        // 1. Fetch Active Staff
        const staffList = await this.prisma.staffProfile.findMany({
            where: { branchId },
            include: { user: true }
        });

        // 2. Fetch Attendance for the Month
        // Helper to get start and end of month
        const startOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
        const endOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

        const attendance = await this.prisma.attendanceRecord.findMany({
            where: {
                branchId,
                date: { gte: startOfMonth, lte: endOfMonth },
                // Filter by users in staffList? Or just fetch all and filter in memory map
            }
        });

        // 3. Calculate Preview
        const preview = staffList.map((staff: any) => {
            const staffAttendance = attendance.filter((a: any) => a.userId === staff.userId);
            const absentDays = staffAttendance.filter((a: any) => a.status === 'ABSENT').length;

            // Standard 30-day LOP Rule
            const dailyRate = Number(staff.baseSalary) / 30;
            const lopDeduction = dailyRate * absentDays;

            // Other deductions (Fixed Tax e.g. 5%? Mocking for now)
            const tax = 0;

            const totalDeductions = lopDeduction + tax;
            const netSalary = Number(staff.baseSalary) - totalDeductions;

            return {
                staffId: staff.id,
                name: staff.user.email, // Or profile name if available
                baseSalary: Number(staff.baseSalary),
                absentDays,
                lopDeduction: parseFloat(lopDeduction.toFixed(2)),
                netSalary: parseFloat(netSalary.toFixed(2)),
                status: 'DRAFT'
            };
        });

        return {
            month: monthDate,
            items: preview,
            totalPayout: preview.reduce((sum: number, item: any) => sum + item.netSalary, 0)
        };
    }

    async commitRun(branchId: string, monthStr: string, items: any[]) {
        const monthDate = new Date(monthStr);

        // Transaction: Create Run + Create Ledgers
        const result = await this.prisma.$transaction(async (tx: any) => {
            const run = await tx.payrollRun.create({
                data: {
                    branchId,
                    month: monthDate,
                    status: 'COMMITTED',
                    totalPayout: items.reduce((sum, i) => sum + i.netSalary, 0),
                }
            });

            for (const item of items) {
                await tx.payrollLedger.create({
                    data: {
                        payrollRunId: run.id,
                        branchId,
                        staffId: item.staffId,
                        month: monthDate,
                        baseSalary: item.baseSalary,
                        totalDeductions: item.lopDeduction,
                        netSalary: item.netSalary,
                        status: 'PAID',
                        paidAt: new Date(),
                    }
                });
            }
            return run;
        });

        // Emit Event
        if (result) {
            await this.eventEmitter.emitAsync('payroll.committed', {
                runId: result.id
            });
        }
        return result;
    }
}
