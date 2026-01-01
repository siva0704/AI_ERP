import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GlobalContextService } from '../../common/context/global-context.service';

@Injectable()
export class ReportingService {
    constructor(
        private prisma: PrismaService,
        private context: GlobalContextService
    ) { }

    async getBranchOverview() {
        const branchId = this.context.branchId;

        // 1. Total Students
        const totalStudents = await this.prisma.studentProfile.count({
            where: { branchId }
        });

        // 2. Total Staff
        const totalStaff = await this.prisma.staffProfile.count({
            where: { branchId }
        });

        // 3. User Count (Total Users)
        const totalUsers = await this.prisma.user.count({
            where: { branchId }
        });

        // 4. Attendance Percentage (Today)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendanceStats = await this.prisma.attendanceRecord.groupBy({
            by: ['status'],
            where: {
                branchId,
                date: {
                    gte: today
                }
            },
            _count: true
        });

        const presentCount = attendanceStats.find(s => s.status === 'PRESENT')?._count || 0;
        const totalAttendance = attendanceStats.reduce((acc, curr) => acc + curr._count, 0);
        const attendancePercentage = totalAttendance > 0 ? (presentCount / totalAttendance) * 100 : 0;

        // 5. Financial Snapshot (Mock for now, needs real FeeLedger aggregation)
        // Aggregating mock fee data
        const totalRevenue = await this.prisma.feeLedger.aggregate({
            where: {
                branchId,
                status: 'COMPLETED',
                type: 'PAYMENT'
            },
            _sum: {
                amount: true
            }
        });

        return {
            totalStudents,
            totalStaff,
            totalUsers,
            attendancePercentage: Math.round(attendancePercentage * 10) / 10,
            revenue: totalRevenue._sum.amount || 0,
            currency: 'USD'
        };
    }
}
