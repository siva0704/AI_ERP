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
        return {
            totalStudents: 125,
            totalStaff: 12,
            totalUsers: 150,
            attendancePercentage: 85.5,
            revenue: 50000,
            currency: 'USD',
            message: 'Data is Mocked'
        };
    }
}
