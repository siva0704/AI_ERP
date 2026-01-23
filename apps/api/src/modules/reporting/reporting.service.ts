import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GlobalContextService } from '../../common/context/global-context.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ReportingService {
    constructor(
        private prisma: PrismaService,
        private context: GlobalContextService,
        private configService: ConfigService
    ) { }

    async getKPIs() {
        // Reuse branch overview logic for Assistant
        const tenantId = this.context.tenantId || 'tenant-123';
        const branchId = this.context.branchId || 'branch-101';
        const role = 'BRANCH_ADMIN'; // Assistant assumes Admin view
        return this.getBranchOverview(tenantId, branchId, role);
    }

    async getBranchOverview(tenantId: string, branchId: string, role: string) {
        if (this.configService.get('MOCK_MODE')) {
            return {
                totalStudents: 1250,
                totalStaff: 85,
                totalUsers: 1335,
                attendancePercentage: 94,
                revenue: 450000,
                currency: 'USD',
                message: 'Mock Data'
            };
        }

        try {
            // 1. Total Students
            const totalStudents = await this.prisma.studentProfile.count({
                where: { branchId, status: 'ACTIVE' }
            });

            // 2. Total Staff
            const totalStaff = await this.prisma.user.count({
                where: {
                    branchId,
                    role: { in: ['STAFF', 'TEACHER'] }
                }
            });

            // 3. Revenue (This Month)
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

            const revenueResult = await this.prisma.feeLedger.aggregate({
                where: {
                    branchId,
                    type: 'PAID',
                    createdAt: { gte: startOfMonth }
                },
                _sum: { amount: true }
            });
            const revenue = Number(revenueResult._sum.amount || 0);

            // 4. Attendance Percentage (Today)
            const todayStart = new Date(now.setHours(0, 0, 0, 0));
            const todayEnd = new Date(now.setHours(23, 59, 59, 999));

            const attendanceRecords = await this.prisma.attendanceRecord.findMany({
                where: {
                    branchId,
                    date: { gte: todayStart, lte: todayEnd }
                },
                select: { status: true }
            });

            let attendancePercentage = 0;
            if (attendanceRecords.length > 0) {
                const presentCount = attendanceRecords.filter((r: any) => r.status === 'PRESENT').length;
                attendancePercentage = Math.round((presentCount / attendanceRecords.length) * 100);
            }

            return {
                totalStudents,
                totalStaff,
                totalUsers: totalStudents + totalStaff,
                attendancePercentage,
                revenue,
                currency: 'USD',
                message: 'Live Data'
            };
        } catch (e: any) {
            return {
                error: true,
                message: e.message,
                stack: e.stack
            };
        }
    }

    async getRevenueTrend(tenantId: string, branchId: string) {
        if (this.configService.get('MOCK_MODE')) {
            const now = new Date();
            return Array.from({ length: 30 }).map((_, i) => {
                const date = new Date();
                date.setDate(now.getDate() - (29 - i));
                return {
                    name: date.toISOString().split('T')[0],
                    revenue: Math.floor(Math.random() * 5000) + 1000,
                    expense: Math.floor(Math.random() * 2000)
                };
            });
        }

        // Last 30 Days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const records = await this.prisma.feeLedger.findMany({
            where: {
                branchId,
                type: 'PAID',
                createdAt: { gte: thirtyDaysAgo }
            },
            select: {
                amount: true,
                createdAt: true
            },
            orderBy: { createdAt: 'asc' }
        });

        // Group by Date (YYYY-MM-DD)
        const dailyMap = new Map<string, number>();

        records.forEach((r: any) => {
            const dateStr = r.createdAt.toISOString().split('T')[0];
            const amount = Number(r.amount);
            dailyMap.set(dateStr, (dailyMap.get(dateStr) || 0) + amount);
        });

        // Convert Map to Array for Recharts
        const trend = Array.from(dailyMap.entries()).map(([date, amount]) => ({
            name: date,
            revenue: amount,
            expense: 0
        }));

        return trend;
    }

    async getAttendanceMatrix(tenantId: string, branchId: string) {
        if (this.configService.get('MOCK_MODE')) {
            const now = new Date();
            return Array.from({ length: 7 }).map((_, i) => {
                const date = new Date();
                date.setDate(now.getDate() - (6 - i));
                return {
                    name: date.toISOString().split('T')[0],
                    present: Math.floor(Math.random() * 20) + 80
                };
            });
        }

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const records = await this.prisma.attendanceRecord.findMany({
            where: {
                branchId,
                date: { gte: sevenDaysAgo }
            },
            select: {
                date: true,
                status: true
            }
        });

        const dailyStats = new Map<string, { present: number, total: number }>();

        records.forEach((r: any) => {
            const dateStr = r.date.toISOString().split('T')[0];
            if (!dailyStats.has(dateStr)) dailyStats.set(dateStr, { present: 0, total: 0 });

            const entry = dailyStats.get(dateStr)!;
            entry.total++;
            if (r.status === 'PRESENT') entry.present++;
        });

        const matrix = Array.from(dailyStats.entries()).map(([date, stats]) => ({
            name: date,
            present: Math.round((stats.present / stats.total) * 100)
        })).sort((a, b) => a.name.localeCompare(b.name));

        return matrix;
    }

    async generateCSV(tenantId: string, branchId: string, type: string): Promise<string> {
        if (this.configService.get('MOCK_MODE')) {
            return 'Date,Student,Amount\n2024-01-01,Mock Student,500.00';
        }

        if (type === 'REVENUE') {
            const records = await this.prisma.feeLedger.findMany({
                where: { branchId, type: 'PAID' },
                select: {
                    createdAt: true,
                    amount: true,
                    description: true,
                    student: {
                        select: { firstName: true, lastName: true, enrollmentNo: true }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });

            const header = 'Date,Student Name,Enrollment No,Description,Amount\n';
            const rows = records.map((r: any) => {
                const date = r.createdAt.toISOString().split('T')[0];
                const name = `"${r.student.firstName} ${r.student.lastName}"`;
                const amount = Number(r.amount).toFixed(2);
                return `${date},${name},${r.student.enrollmentNo},"${r.description}",${amount}`;
            }).join('\n');

            return header + rows;
        }

        return 'Invalid Export Type';
    }
}
