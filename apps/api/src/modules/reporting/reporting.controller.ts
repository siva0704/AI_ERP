import { Controller, Get, UseGuards, Res, Query } from '@nestjs/common';
import type { Response } from 'express';
import { ReportingService } from './reporting.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

import { GlobalContextService } from '../../common/context/global-context.service';

@Controller('reporting')
@UseGuards(RolesGuard)
export class ReportingController {
    constructor(
        private readonly reportingService: ReportingService,
        private readonly context: GlobalContextService
    ) { }

    @Get('branch-overview')
    @Roles('GROUP_ADMIN', 'BRANCH_ADMIN')
    async getBranchOverview() {
        const tenantId = this.context.tenantId;
        const branchId = this.context.branchId;
        const role = this.context.role || 'GUEST';

        if (!tenantId || !branchId) {
            console.error('DEBUG: Controller Context Missing:', { tenantId, branchId });
            // Avoid 500, throw informative error
            throw new Error(`Context missing. Tenant: ${tenantId}, Branch: ${branchId}`);
        }
        return await this.reportingService.getBranchOverview(tenantId, branchId, role);
    }

    @Get('revenue-trend')
    @Roles('GROUP_ADMIN', 'BRANCH_ADMIN')
    async getRevenueTrend() {
        const tenantId = this.context.tenantId;
        const branchId = this.context.branchId;
        if (!tenantId || !branchId) throw new Error('Context missing');
        return await this.reportingService.getRevenueTrend(tenantId, branchId);
    }

    @Get('attendance-matrix')
    @Roles('GROUP_ADMIN', 'BRANCH_ADMIN')
    async getAttendanceMatrix() {
        const tenantId = this.context.tenantId;
        const branchId = this.context.branchId;
        if (!tenantId || !branchId) throw new Error('Context missing');
        return await this.reportingService.getAttendanceMatrix(tenantId, branchId);
    }

    @Get('export')
    @Roles('GROUP_ADMIN', 'BRANCH_ADMIN')
    async exportReport(@Res() res: Response, @Query('type') type: string = 'REVENUE') {
        const tenantId = this.context.tenantId;
        const branchId = this.context.branchId;
        if (!tenantId || !branchId) throw new Error('Context missing');

        const csv = await this.reportingService.generateCSV(tenantId, branchId, type);

        res.set({
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="report-${type.toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv"`,
        });

        res.send(csv);
    }
}
