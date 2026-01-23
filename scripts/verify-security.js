
const BASE_URL = 'http://localhost:3001/api';

async function request(path, method, body, headers) {
    try {
        const res = await fetch(`${BASE_URL}${path}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
        });
        const data = await res.json().catch(() => ({}));
        return { status: res.status, data };
    } catch (e) {
        return { status: 'ERROR', error: e.message };
    }
}

async function run() {
    console.log('\n--- Starting Phase 13 Security Verification ---\n');

    // 1. "Hacker" Test: Student trying to Create Route
    console.log('1. Testing "Hacker" Access (Student Role trying to create route)...');
    const hackerHeaders = {
        'Content-Type': 'application/json',
        'x-user-role': 'STUDENT',
        'x-tenant-id': 'tenant-123',
        'x-branch-id': 'branch-101'
    };

    const hackerRes = await request('/transport/routes', 'POST', {
        name: 'Hacker Route',
        monthlyCost: 0
    }, hackerHeaders);

    if (hackerRes.status === 403) {
        console.log('   ✅ BLOCKED: Student cannot create routes (403 Forbidden).');
    } else {
        console.error('   ❌ FAILED: Student access was NOT blocked.', hackerRes);
    }

    // 2. "Context Leak" Test
    console.log('\n2. Testing "Context Isolation" (Tenant B trying to see Tenant A routes)...');

    // 2a. Create Route as Tenant 123 (Valid)
    const adminAHeaders = {
        'Content-Type': 'application/json',
        'x-user-role': 'BRANCH_ADMIN',
        'x-tenant-id': 'tenant-123',
        'x-branch-id': 'branch-101'
    };
    const routeARes = await request('/transport/routes', 'POST', {
        name: 'Route Protected 123',
        monthlyCost: 100
    }, adminAHeaders);

    if (routeARes.status === 201) {
        console.log('   ✅ Created Route for Tenant 123.');
    } else {
        console.error('   ❌ Failed to create route for Tenant 123:', routeARes);
    }

    // 2b. Query Routes as Tenant 456 (Non-Existent but valid Context)
    const adminBHeaders = {
        'Content-Type': 'application/json',
        'x-user-role': 'BRANCH_ADMIN',
        'x-tenant-id': 'tenant-456',
        'x-branch-id': 'branch-101'
    };
    const routeBRes = await request('/transport/routes', 'GET', null, adminBHeaders);

    if (routeBRes.status === 200 && Array.isArray(routeBRes.data)) {
        if (routeBRes.data.length === 0) {
            console.log('   ✅ ISOLATED: Tenant 456 sees 0 routes (Correct).');
        } else {
            console.error('   ❌ LEAK: Tenant 456 CAN see data!', routeBRes.data);
        }
    } else {
        console.error('   ❌ Failed to get routes for Tenant 456:', routeBRes);
    }

    console.log('\n--- Security Verification Complete ---');
}

run();
