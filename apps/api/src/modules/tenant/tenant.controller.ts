import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { TenantService } from './tenant.service';

@Controller('tenants')
export class TenantController {
    constructor(private readonly tenantService: TenantService) { }

    @Post()
    async createTenant(@Body('name') name: string) {
        return this.tenantService.createTenant(name);
    }

    @Post(':tenantId/branches')
    async createBranch(
        @Param('tenantId') tenantId: string,
        @Body('name') name: string,
    ) {
        return this.tenantService.createBranch(tenantId, name);
    }

    @Get(':tenantId/branches')
    async listBranches(@Param('tenantId') tenantId: string) {
        return this.tenantService.listBranches(tenantId);
    }
}
