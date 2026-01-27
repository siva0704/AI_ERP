import { Controller, Get, Post, Put, Body, Param, UseGuards, Query } from '@nestjs/common';
import { StaffService } from './staff.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GlobalContextService } from '../../common/context/global-context.service';
import { CreateStaffDto } from './dto/create-staff.dto';

@Controller('staff')
@UseGuards(RolesGuard)
export class StaffController {
    constructor(
        private readonly staffService: StaffService,
        private readonly context: GlobalContextService
    ) { }

    @Get()
    @Roles('GROUP_ADMIN', 'BRANCH_ADMIN')
    async getStaffList(@Query('search') search?: string) {
        const branchId = this.context.branchId;
        if (!branchId) throw new Error('Branch Context Missing');
        return this.staffService.getStaffList(branchId, search);
    }

    @Post()
    @Roles('GROUP_ADMIN', 'BRANCH_ADMIN')
    async createStaffProfile(@Body() body: CreateStaffDto) {
        const branchId = this.context.branchId;
        if (!branchId) throw new Error('Branch Context Missing');

        // Ensure branchId is injected if not present (though mostly it comes from context)
        return this.staffService.createStaffProfile({ ...body, branchId });
    }

    @Put(':id')
    @Roles('GROUP_ADMIN', 'BRANCH_ADMIN')
    async updateStaffProfile(@Param('id') id: string, @Body() body: any) {
        const branchId = this.context.branchId;
        if (!branchId) throw new Error('Branch Context Missing');
        return this.staffService.updateStaffProfile(id, branchId, body);
    }
}
