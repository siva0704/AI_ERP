const API_URL = 'http://localhost:3001/api/transport/routes';

async function testRole(role) {
    console.log(`Testing Role: ${role}...`);
    try {
        const res = await fetch(API_URL, {
            headers: {
                'Content-Type': 'application/json',
                'x-tenant-id': 'tenant-123',
                'x-branch-id': 'branch-101',
                'x-user-role': role
            }
        });

        if (res.ok) {
            console.log(`✅ Success for ${role} (Status: ${res.status})`);
        } else {
            console.error(`❌ Failed for ${role} (Status: ${res.status}) - ${await res.text()}`);
        }
    } catch (e) {
        console.error(`💥 Error for ${role}:`, e);
    }
}

async function run() {
    await testRole('BRANCH_ADMIN');
    await testRole('GROUP_ADMIN');
    await testRole('STAFF');
    await testRole('STUDENT');
    await testRole('GUEST'); // Should fail
}

run();
