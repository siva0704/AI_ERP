import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const API_URL = 'http://127.0.0.1:3001/api'; // Updated Port to 3001

async function run() {
    console.log('--- Starting Payroll Verification ---');

    // 1. Setup Data using PRE-EXISTING Branch 'default-branch'
    const branchId = 'default-branch';

    // Create unique user
    const email = `staff-${Date.now()}@test.com`;
    // Clean up if exists (unlikely with timestamp)

    const user = await prisma.user.create({
        data: {
            email,
            role: 'STAFF',
            branchId,
            provider: 'INTERNAL'
        }
    });

    const staff = await prisma.staffProfile.create({
        data: {
            userId: user.id,
            branchId,
            designation: 'Teacher',
            department: 'Math',
            baseSalary: 3000 // $3000/month => $100/day
        }
    });

    console.log(`Created Staff ${staff.id} (${email}) with Base Salary $3000.`);

    // 2. Add Attendance (2 Days Absent)
    const today = new Date();
    await prisma.attendanceRecord.createMany({
        data: [
            { date: new Date(today.getFullYear(), today.getMonth(), 5), status: 'ABSENT', userId: user.id, branchId },
            { date: new Date(today.getFullYear(), today.getMonth(), 6), status: 'ABSENT', userId: user.id, branchId },
            { date: new Date(today.getFullYear(), today.getMonth(), 7), status: 'PRESENT', userId: user.id, branchId },
        ]
    });
    console.log('Added 2 Absent records.');

    // 3. Call API
    console.log(`Calling API to calculate salary for Staff ${staff.id}...`);
    try {
        const response = await fetch(`${API_URL}/payroll/calculate/${staff.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText} - ${await response.text()}`);
        }

        const result = await response.json();
        console.log('Calculation Result:', JSON.stringify(result, null, 2));

        const netSalary = Number(result.netSalary);

        if (netSalary === 2800) {
            console.log('✅ SUCCESS: Net Salary is 2800 as expected.');
        } else {
            console.error(`❌ FAILURE: Expected 2800, got ${netSalary}`);
        }
    } catch (e) {
        console.error('Test Failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

run();
