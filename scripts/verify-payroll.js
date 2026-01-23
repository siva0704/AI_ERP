const { PrismaClient } = require('../packages/database/node_modules/@prisma/client');
const prisma = new PrismaClient();

const API_URL = 'http://localhost:3001/api';
// Use Admin Headers
const HEADERS = {
    'Content-Type': 'application/json',
    'x-tenant-id': 'tenant-123',
    'x-branch-id': 'branch-101',
    'x-user-role': 'BRANCH_ADMIN'
};

async function verifyPayroll() {
    console.log('--- Phase 16: Staff & Payroll Verification ---');
    try {
        // 1. Setup Staff
        console.log('1. Setting up Test Staff...');
        let user = await prisma.user.findFirst({ where: { role: 'TEACHER' } });
        if (!user) {
            console.log('   Creating Test Teacher...');
            // Need a branch first
            let branch = await prisma.branch.findFirst({ where: { id: 'branch-101' } });
            if (!branch) {
                // Create Tenant and Branch if totally empty
                const tenant = await prisma.tenant.create({ data: { id: 'tenant-123', name: 'Test Tenant' } });
                branch = await prisma.branch.create({ data: { id: 'branch-101', name: 'Test Branch', tenantId: tenant.id } });
            }

            user = await prisma.user.create({
                data: {
                    email: 'teacher.test@school.com',
                    role: 'TEACHER',
                    branchId: 'branch-101',
                    provider: 'INTERNAL'
                }
            });
        }

        // Upsert Staff Profile
        const staff = await prisma.staffProfile.upsert({
            where: { userId: user.id },
            update: { baseSalary: 3000 }, // $3000/month
            create: {
                userId: user.id,
                branchId: 'branch-101',
                designation: 'Senior Teacher',
                department: 'ACADEMIC',
                baseSalary: 3000
            }
        });
        console.log(`   Staff: ${user.email}, Salary: $3000`);

        // 2. Mark Attendance (2 Days Absent)
        console.log('2. Marking 2 Days Absent...');
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        // Clear previous attendance for test purity
        await prisma.attendanceRecord.deleteMany({
            where: { userId: user.id, date: { gte: startOfMonth } }
        });
        // Clear previous runs/ledgers for test purity
        await prisma.payrollLedger.deleteMany({
            where: { staffId: staff.id, month: new Date(formatISOOnly(startOfMonth)) }
        });
        await prisma.payrollRun.deleteMany({
            where: { branchId: 'branch-101', month: new Date(formatISOOnly(startOfMonth)) }
        });

        // Add 2 Absent Records
        await prisma.attendanceRecord.createMany({
            data: [
                {
                    userId: user.id,
                    branchId: 'branch-101',
                    date: new Date(today.getFullYear(), today.getMonth(), 5),
                    status: 'ABSENT'
                },
                {
                    userId: user.id,
                    branchId: 'branch-101',
                    date: new Date(today.getFullYear(), today.getMonth(), 6),
                    status: 'ABSENT'
                }
            ]
        });

        // 3. Test Preview (LOP Logic)
        console.log('3. Testing Payroll Preview (LOP Logic)...');
        const monthStr = formatISOOnly(startOfMonth); // YYYY-MM-DD
        const resPreview = await fetch(`${API_URL}/payroll/preview`, {
            method: 'POST',
            headers: HEADERS,
            body: JSON.stringify({ month: monthStr })
        });

        if (!resPreview.ok) throw new Error(await resPreview.text());
        const preview = await resPreview.json();

        const item = preview.items.find(i => i.staffId === staff.id);
        if (!item) throw new Error('Staff not found in preview');

        // Expectation: $3000 / 30 = $100/day. 2 days absent = $200 deduction.
        console.log(`   Expected Deduction: $200. Actual: $${item.lopDeduction}`);
        if (Math.abs(item.lopDeduction - 200) > 0.1) throw new Error('LOP Calculation Failed');
        console.log('   ✅ LOP Logic Verified');

        // 4. Test Commit
        console.log('4. Testing Run Commit...');
        const resCommit = await fetch(`${API_URL}/payroll/commit`, {
            method: 'POST',
            headers: HEADERS,
            body: JSON.stringify({ month: monthStr, items: preview.items })
        });
        if (!resCommit.ok) throw new Error('Commit Failed');
        console.log('   ✅ Run Committed');

        // 5. Verify Ledger
        console.log('5. Verifying Ledger...');
        const ledger = await prisma.payrollLedger.findFirst({
            where: { staffId: staff.id, month: new Date(monthStr) }
        });
        if (!ledger) throw new Error('Ledger Record Missing');
        console.log(`   Ledger Net Salary: $${ledger.netSalary}`);
        console.log('   ✅ Ledger Verified');

        console.log('✅ Phase 16 Verified: Payroll Engine is Operational.');

    } catch (e) {
        console.error('❌ Phase 16 Verification Failed:', e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

function formatISOOnly(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}-01`;
}

verifyPayroll();
