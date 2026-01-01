
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TransportService {
    constructor(private prisma: PrismaService) { }

    async createRoute(tenantId: string, branchId: string, data: any) {
        return this.prisma.transportRoute.create({
            data: { ...data, tenantId, branchId },
        });
    }

    async getRoutes(tenantId: string, branchId: string) {
        return this.prisma.transportRoute.findMany({
            where: { tenantId, branchId },
            include: { vehicle: true },
        });
    }

    async allocateStudent(tenantId: string, branchId: string, routeId: string, studentId: string) {
        const route = await this.prisma.transportRoute.findUnique({ where: { id: routeId } });
        if (!route) throw new NotFoundException('Route not found');

        // 1. Create Allocation
        const allocation = await this.prisma.transportAllocation.create({
            data: {
                tenantId, branchId, routeId, studentId,
                startDate: new Date(),
            },
        });

        // 2. Inject Monthly Fee (One-time charge for current month as proof of concept)
        await this.prisma.feeLedger.create({
            data: {
                branchId, studentId,

                description: `Transport Fee: ${route.name}`,
                amount: route.monthlyCost,
                type: 'DUE',
                status: 'PENDING',
            },
        });

        return allocation;
    }
}
