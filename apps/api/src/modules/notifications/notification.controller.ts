import { Controller, Post, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GlobalContextService } from '../../common/context/global-context.service';

@Controller('notifications')
@UseGuards(RolesGuard)
export class NotificationController {
    constructor(
        private readonly notificationService: NotificationService,
        private readonly context: GlobalContextService
    ) { }

    @Post('broadcast')
    @Roles('GROUP_ADMIN', 'BRANCH_ADMIN')
    async broadcast(@Body() body: { role: string, subject: string, message: string }) {
        const branchId = this.context.branchId;
        if (!branchId) throw new Error('Branch Context Missing');
        if (!body.role || !body.subject || !body.message) throw new BadRequestException('Missing fields');

        // Validation for Role
        const validRoles = ['STAFF', 'PARENT', 'STUDENT', 'TEACHER'];
        if (!validRoles.includes(body.role)) throw new BadRequestException('Invalid Audience Role');

        return this.notificationService.broadcast(body.role, branchId, body.subject, body.message);
    }
}
