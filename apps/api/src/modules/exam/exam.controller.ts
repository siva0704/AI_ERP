import { Controller, Get, Post, Body, Req, UseGuards, Param } from '@nestjs/common';
import { ExamService } from './exam.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GlobalContextService } from '../../common/context/global-context.service';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('exams')
@UseGuards(RolesGuard)
export class ExamController {
    constructor(
        private readonly examService: ExamService,
        private readonly context: GlobalContextService,
        private readonly prisma: PrismaService // direct injection for simple CRUD
    ) { }

    @Get()
    @Roles('BRANCH_ADMIN', 'STAFF', 'STUDENT')
    async getExams() {
        const branchId = this.context.branchId || 'default';
        return this.prisma.exam.findMany({
            where: { branchId },
            include: { subject: true }
        });
    }

    @Post()
    @Roles('BRANCH_ADMIN')
    async createExam(@Body() body: any) {
        const branchId = this.context.branchId || 'default';
        return this.prisma.exam.create({
            data: {
                ...body,
                branchId,
                date: new Date(body.date)
            }
        });
    }

    @Post('marks')
    @Roles('STAFF', 'BRANCH_ADMIN')
    async submitMarks(@Body() body: any) {
        const branchId = this.context.branchId || 'default';
        return this.examService.submitMarks({
            ...body,
            branchId
        });
    }
}
