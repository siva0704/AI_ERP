import { Controller, Get, Post, Body, Param, UseGuards, Res } from '@nestjs/common';
import { PayrollService } from './payroll.service';
import type { Response } from 'express';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('payroll')
@UseGuards(RolesGuard)
export class PayrollController {
    constructor(private readonly payrollService: PayrollService) { }

    @Get('ledger')
    @Roles('GROUP_ADMIN', 'BRANCH_ADMIN')
    async getPayrollLedger() {
        return await this.payrollService.getPayrollLedger();
    }

    @Post('calculate/:staffId')
    async calculateSalary(@Param('staffId') staffId: string) {
        return await this.payrollService.calculateMonthlySalary(staffId);
    }

    @Get('payslip/:ledgerId')
    async downloadPayslip(@Param('ledgerId') ledgerId: string, @Res() res: Response) {
        const { filename, buffer } = await this.payrollService.generatePayslip(ledgerId);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Length': String(buffer.length),
        });

        res.end(buffer);
    }
}
