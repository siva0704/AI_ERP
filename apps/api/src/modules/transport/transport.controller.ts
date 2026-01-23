import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { TransportService } from './transport.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { RolesGuard } from '../../common/guards/roles.guard';
import { GlobalContextService } from '../../common/context/global-context.service';

@Controller('transport')
@UseGuards(RolesGuard)
// Trigger Rebuild
export class TransportController {
    constructor(
        private readonly transportService: TransportService,
        private readonly context: GlobalContextService
    ) { }

    @Post('routes')
    @Roles(Role.BRANCH_ADMIN)
    createRoute(@Body() body: any) {
        const tenantId = this.context.tenantId;
        const branchId = this.context.branchId;
        if (!tenantId || !branchId) throw new Error('Context missing');
        return this.transportService.createRoute(tenantId, branchId, body);
    }

    @Get('routes')
    @Roles(Role.GROUP_ADMIN, Role.BRANCH_ADMIN, Role.STAFF, Role.STUDENT)
    getRoutes() {
        const tenantId = this.context.tenantId;
        const branchId = this.context.branchId;
        if (!tenantId || !branchId) throw new Error('Context missing');
        return this.transportService.getRoutes(tenantId, branchId);
    }

    @Post('allocate')
    @Roles(Role.BRANCH_ADMIN)
    allocateStudent(@Body() body: { routeId: string; studentId: string }) {
        const tenantId = this.context.tenantId;
        const branchId = this.context.branchId;
        if (!tenantId || !branchId) throw new Error('Context missing');
        return this.transportService.allocateStudent(tenantId, branchId, body.routeId, body.studentId);
    }
}
