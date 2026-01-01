import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TenantService {
    constructor(private readonly prisma: PrismaService) { }

    async createTenant(name: string) {
        return this.prisma.tenant.create({
            data: { name },
        });
    }

    async createBranch(tenantId: string, name: string) {
        return this.prisma.branch.create({
            data: {
                name,
                tenantId,
            },
        });
    }

    async listBranches(tenantId: string) {
        return this.prisma.branch.findMany({
            where: { tenantId },
        });
    }
}
