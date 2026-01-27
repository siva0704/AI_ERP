
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Database Status Report ---');

    try {
        const tenantCount = await prisma.tenant.count();
        console.log(`Tenants: ${tenantCount}`);

        const branchCount = await prisma.branch.count();
        console.log(`Branches: ${branchCount}`);

        const userCount = await prisma.user.count();
        console.log(`Users: ${userCount}`);

        const studentCount = await prisma.studentProfile.count();
        console.log(`Students: ${studentCount}`);

        const staffCount = await prisma.staffProfile.count();
        console.log(`Staff: ${staffCount}`);

        const documentCount = await prisma.document.count();
        console.log(`Documents: ${documentCount}`);

        // Check for recent activity (last 24 hours)
        const recentAudit = await prisma.auditLog.count({
            where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
        });
        console.log(`Recent Audit Logs: ${recentAudit}`);

    } catch (e) {
        console.error('Error fetching stats:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
