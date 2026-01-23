
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TransportService {
    constructor(
        private prisma: PrismaService,
        private configService: ConfigService
    ) { }

    async createRoute(tenantId: string, branchId: string, data: any) {
        if (this.configService.get('MOCK_MODE')) {
            return { id: 'mock-route', ...data, tenantId, branchId };
        }
        return this.prisma.transportRoute.create({
            data: { ...data, tenantId, branchId },
        });
    }

    async getRoutes(tenantId: string, branchId: string) {
        if (this.configService.get('MOCK_MODE')) {
            return [
                { id: '1', name: 'Route A', monthlyCost: 100, vehicle: { number: 'BUS-01' } },
                { id: '2', name: 'Route B', monthlyCost: 120, vehicle: { number: 'BUS-02' } }
            ];
        }
        return this.prisma.transportRoute.findMany({
            where: { tenantId, branchId },
            include: { vehicle: true },
        });
    }

    async allocateStudent(tenantId: string, branchId: string, routeId: string, studentId: string) {
        if (this.configService.get('MOCK_MODE')) {
            return {
                id: 'mock-allocation',
                tenantId, branchId, routeId, studentId,
                startDate: new Date()
            };
        }
        const route = await this.prisma.transportRoute.findUnique({ where: { id: routeId } });
        if (!route) throw new NotFoundException('Route not found');

        // 1. Create Allocation
        return this.prisma.$transaction(async (tx: any) => {
            // 1. Create Allocation
            const allocation = await tx.transportAllocation.create({
                data: {
                    tenantId, branchId, routeId, studentId,
                    startDate: new Date(),
                },
            });

            // 2. Inject Monthly Fee (One-time charge for current month as proof of concept)
            await tx.feeLedger.create({
                data: {
                    branchId, studentId,
                    description: `Transport Fee: ${route.name}`,
                    amount: route.monthlyCost,
                    type: 'DUE',
                    status: 'PENDING',
                },
            });

            return allocation;
        });
    }
}
