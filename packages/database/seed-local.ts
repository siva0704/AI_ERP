import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding local database...');

    // 1. Create Tenant
    const tenant = await prisma.tenant.create({
        data: {
            id: 'default-tenant-id',
            name: 'Default Tenant',
        },
    });
    console.log('Created Tenant:', tenant.id);

    // 2. Create Branch
    const branch = await prisma.branch.create({
        data: {
            id: 'default-branch',
            name: 'Main Branch',
            tenantId: tenant.id,
        },
    });
    console.log('Created Branch:', branch.id);

    // 3. Create User (Standard User matching Mock Context)
    const user = await prisma.user.create({
        data: {
            id: 'demo-user-id',
            email: 'demo@example.com',
            role: 'BRANCH_ADMIN',
            branchId: branch.id,
        },
    });
    console.log('Created User:', user.id);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
