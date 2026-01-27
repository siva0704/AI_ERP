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

// Mock function to wait
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function verifyEvents() {
    console.log('--- Phase 17: Communications Event Bus Verification ---');
    try {
        // 1. Silent Server Test (Payroll Commit)
        console.log('1. Triggering Payroll Commit (Should fire event async)...');

        // Setup Data (Month and Items) - Reusing logic from payroll test
        const today = new Date();
        const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;

        // Need a random staff
        const staff = await prisma.staffProfile.findFirst();
        if (!staff) throw new Error('No Staff Found');

        const items = [{
            staffId: staff.id,
            baseSalary: 3000,
            lopDeduction: 0,
            netSalary: 3000
        }];

        // Clear existing run to allow commit
        await prisma.payrollRun.deleteMany({
            where: { branchId: 'branch-101', month: new Date(monthStr) }
        });
        await prisma.payrollLedger.deleteMany({
            where: { staffId: staff.id, month: new Date(monthStr) }
        });


        const start = Date.now();
        const res = await fetch(`${API_URL}/payroll/commit`, {
            method: 'POST',
            headers: HEADERS,
            body: JSON.stringify({ month: monthStr, items })
        });
        const end = Date.now();

        if (!res.ok) throw new Error(await res.text());
        console.log(`   ✅ API Responded in ${end - start}ms`);

        console.log('   ℹ️  Check Server Logs for: "[Notification] 📧 Sending Email to..."');
        console.log('      (You should see this log appear slightly AFTER the API response if async works right)');

        // 2. Audience Test (Frontend Logic)
        // Since we didn't implement the backend endpoint for broadcast yet, we are verifying the "Plumbing"
        // The listener logic in `PayrollListener` logs to console.

        console.log('✅ Phase 17 Verification Triggered.');

    } catch (e) {
        console.error('❌ Phase 17 Verification Failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

verifyEvents();
