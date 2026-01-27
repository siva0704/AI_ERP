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
        return this.prisma.$transaction(async (tx) => {
            // 1. Create Branch
            const branch = await tx.branch.create({
                data: {
                    name,
                    tenantId,
                },
            });

            // 2. Seed Standard Classes (Grades 1-10)
            const classes = Array.from({ length: 10 }, (_, i) => ({
                name: `Grade ${i + 1}`,
                capacity: 40,
                branchId: branch.id
            }));
            await tx.classroom.createMany({ data: classes });

            // 3. Seed Standard Subjects (Karnataka Board - Simplified)
            const subjects = [
                { name: 'Kannada', code: 'KAN' },
                { name: 'English', code: 'ENG' },
                { name: 'Hindi', code: 'HIN' },
                { name: 'Mathematics', code: 'MAT' },
                { name: 'Science', code: 'SCI' },
                { name: 'Social Science', code: 'SOC' }
            ].map(s => ({
                ...s,
                branchId: branch.id
            }));
            await tx.subject.createMany({ data: subjects });

            // 4. Seed Fee Structures (Default)
            await tx.feeStructure.create({
                data: {
                    name: 'Standard Tuition Fee',
                    amount: 5000,
                    currency: 'USD',
                    branchId: branch.id
                }
            });

            return branch;
        });
    }

    async listBranches(tenantId: string) {
        return this.prisma.branch.findMany({
            where: { tenantId },
        });
    }
}
