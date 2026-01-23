
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verify() {
    console.log("🔍 Starting Phase 20 Verification...");

    // 1. Check Karnataka Classes
    const classes = await prisma.classroom.findMany({
        where: { branchId: 'branch-101' },
        select: { name: true }
    });
    console.log(`\n📚 Classrooms Found: ${classes.length}`);
    const hasClass10 = classes.some(c => c.name === 'Class 10');
    const hasPUC = classes.some(c => c.name.includes('PUC'));
    console.log(`   - Class 10 exists: ${hasClass10 ? '✅' : '❌'}`);
    console.log(`   - PUC exists: ${hasPUC ? '✅' : '❌'}`);

    // 2. Check Karnataka Subjects
    const subjects = await prisma.subject.findMany({
        where: { branchId: 'branch-101' },
        select: { name: true, code: true }
    });
    console.log(`\n📖 Subjects Found: ${subjects.length}`);
    const hasKannada = subjects.some(s => s.name === 'Kannada');
    const hasPCMB = subjects.some(s => ['Physics', 'Chemistry', 'Mathematics', 'Biology'].includes(s.name));
    console.log(`   - Kannada exists: ${hasKannada ? '✅' : '❌'}`);
    console.log(`   - Science Core exists: ${hasPCMB ? '✅' : '❌'}`);

    // 3. Check Tenant Context
    const tenant = await prisma.tenant.findUnique({ where: { id: 'tenant-123' } });
    console.log(`\n🏢 Tenant Check: ${tenant ? '✅ Found ' + tenant.name : '❌ Not Found'}`);

    await prisma.$disconnect();
}

verify().catch(console.error);
