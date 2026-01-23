import { Controller, Post, Get, Body, Req, UseGuards } from '@nestjs/common';
import { TimetableService } from './timetable.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GlobalContextService } from '../../common/context/global-context.service';

@Controller('timetable')
@UseGuards(RolesGuard)
export class TimetableController {
    constructor(
        private readonly timetableService: TimetableService,
        private readonly context: GlobalContextService
    ) { }

    @Post('blocks')
    @Roles('BRANCH_ADMIN')
    async createTimeSlot(@Body() body: any) {
        // Stub for creating the slots first (09:00, 10:00, etc.)
        return { msg: 'Create TimeSlot logic here using Prisma' };
    }

    @Post('sessions')
    @Roles('BRANCH_ADMIN')
    async scheduleSession(@Body() body: any) {
        const branchId = this.context.branchId || 'default';
        const tenantId = this.context.tenantId || 'default';
        return this.timetableService.createSession(tenantId, branchId, {
            ...body,
            branchId // Redundant but harmless, service uses argument
        });
    }

    @Get('sessions')
    @Roles('BRANCH_ADMIN', 'STAFF', 'STUDENT')
    async getTimetable(@Req() req: any) {
        const user = req.user;
        const branchId = this.context.branchId || '';
        const role = this.context.role;

        // If Admin, fetch ALL for branch
        if (role === 'BRANCH_ADMIN' || role === 'GROUP_ADMIN') {
            return this.timetableService.getBranchTimetable(branchId);
        }

        // Else, fetch personal
        return this.timetableService.getMyTimetable(user?.sub || user?.id);
    }
}
