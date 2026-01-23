import { Controller, Get, Post, Body, Param, UseGuards, BadRequestException } from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GlobalContextService } from '../../common/context/global-context.service';

@Controller('payroll')
@UseGuards(RolesGuard)
export class PayrollController {
    constructor(
        private readonly payrollService: PayrollService,
        private readonly context: GlobalContextService
    ) { }

    @Get('runs')
    @Roles('GROUP_ADMIN', 'BRANCH_ADMIN')
    async getPayrollRuns() {
        const branchId = this.context.branchId;
        if (!branchId) throw new Error('Context Missing');
        return this.payrollService.getPayrollRuns(branchId);
    }

    @Get('runs/:id')
    @Roles('GROUP_ADMIN', 'BRANCH_ADMIN')
    async getRunDetails(@Param('id') id: string) {
        const branchId = this.context.branchId;
        if (!branchId) throw new Error('Context Missing');
        return this.payrollService.getRunDetails(id, branchId);
    }

    @Post('preview')
    @Roles('GROUP_ADMIN', 'BRANCH_ADMIN')
    async previewRun(@Body() body: { month: string }) {
        const branchId = this.context.branchId;
        if (!branchId) throw new Error('Context Missing');
        if (!body.month) throw new BadRequestException('Month is required');
        return this.payrollService.previewRun(branchId, body.month);
    }

    @Post('commit')
    @Roles('GROUP_ADMIN', 'BRANCH_ADMIN')
    async commitRun(@Body() body: { month: string, items: any[] }) {
        const branchId = this.context.branchId;
        if (!branchId) throw new Error('Context Missing');
        // Verify items array exists
        if (!body.items || !Array.isArray(body.items)) throw new BadRequestException('Items array required');
        return this.payrollService.commitRun(branchId, body.month, body.items);
    }
}
