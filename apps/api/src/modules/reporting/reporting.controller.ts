import { Controller, Get, UseGuards } from '@nestjs/common';
import { ReportingService } from './reporting.service';

@Controller('reporting')
export class ReportingController {
    constructor(private readonly reportingService: ReportingService) { }

    @Get('branch-overview')
    async getBranchOverview() {
        return await this.reportingService.getBranchOverview();
    }
}
