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
        return this.timetableService.createSession({
            ...body,
            branchId
        });
    }

    @Get('sessions')
    @Roles('BRANCH_ADMIN', 'STAFF', 'STUDENT')
    async getTimetable(@Req() req: any) {
        // Return My Timetable for Teacher/Student
        // Return All for Admin?
        // For MVP Phase 7, let's just expose a "get mine" relative to user ID, or generic list for Admin
        const user = req.user;
        // If admin, maybe search by query params?
        // Let's implement specific `my` endpoint
        return this.timetableService.getMyTimetable(user?.sub || user?.id);
    }
}
