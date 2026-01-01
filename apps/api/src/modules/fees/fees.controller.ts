import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { FeesService } from './fees.service';
import { GlobalContextService } from '../../common/context/global-context.service';

@Controller('fees')
export class FeesController {
    constructor(
        private readonly feesService: FeesService,
        private readonly context: GlobalContextService,
    ) { }

    @Post('structure')
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
