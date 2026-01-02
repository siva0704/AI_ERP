import { Controller, Get, UseGuards } from '@nestjs/common';
import { ReportingService } from './reporting.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('reporting')
@UseGuards(RolesGuard)
export class ReportingController {
    constructor(private readonly reportingService: ReportingService) { }

    @Get('branch-overview')
    @Roles('GROUP_ADMIN', 'BRANCH_ADMIN')
    async getBranchOverview() {
        return await this.reportingService.getBranchOverview();
    }
}
