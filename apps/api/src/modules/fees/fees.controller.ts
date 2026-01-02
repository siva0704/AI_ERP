import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { FeesService } from './fees.service';
import { GlobalContextService } from '../../common/context/global-context.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('fees')
@UseGuards(RolesGuard)
export class FeesController {
    constructor(
        private readonly feesService: FeesService,
        private readonly context: GlobalContextService,
    ) { }

    @Post('structure')
    @Roles('GROUP_ADMIN', 'BRANCH_ADMIN')
    async createFeeStructure(@Body() body: { name: string; amount: number; currency: string }) {
        return this.feesService.createFeeStructure(body);
    }

    @Get('structure')
    async getFeeStructures() {
        return this.feesService.getFeeStructures();
    }

    @Post('collect')
    async collectPayment(@Body() body: { studentId: string; amount: number; description: string; paymentMethod?: string }) {
        return this.feesService.collectPayment(body);
    }

    @Get('dues/:studentId')
    async getStudentDues(@Param('studentId') studentId: string) {
        return this.feesService.getStudentDues(studentId);
    }
}
