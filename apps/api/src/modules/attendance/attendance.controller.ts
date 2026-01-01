import { Controller, Post, Get, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GlobalContextService } from '../../common/context/global-context.service';

@Controller('attendance')
@UseGuards(RolesGuard) // In real app, bind AuthGuard too
export class AttendanceController {
    constructor(
        private readonly attendanceService: AttendanceService,
        private readonly context: GlobalContextService,
    ) { }

    @Post()
    @Roles('STAFF', 'BRANCH_ADMIN')
    async markAttendance(@Body() body: any) {
        const branchId = this.context.branchId || 'default-branch'; // Safety fallback

        return this.attendanceService.markAttendance({
            ...body,
            branchId,
            date: new Date(body.date),
        });
    }

    @Get('student/:studentId')
    async getStudentAttendance(@Param('studentId') studentId: string) {
        // Logic to resolve userId from studentId would ideally be here or in service 
        // For MVP, assuming studentId IS userId or passed correctly
        return this.attendanceService.getAttendance(studentId);
    }

    @Post('bulk')
    @Roles('STAFF', 'BRANCH_ADMIN')
    async bulkMarkAttendance(@Body() body: { items: any[], date: string }) {
        const branchId = this.context.branchId || 'default-branch';
        return this.attendanceService.bulkMarkAttendance(body.items, new Date(body.date), branchId);
    }

    @Get('report')
    @Roles('BRANCH_ADMIN')
    async getAttendanceReport(@Req() req: any) {
        const branchId = this.context.branchId || 'default-branch';
        return this.attendanceService.getAttendanceReport(branchId);
    }
}
