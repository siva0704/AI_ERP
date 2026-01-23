const API_URL = 'http://localhost:3001/api';
const HEADERS_ADMIN = {
    'Content-Type': 'application/json',
    'x-tenant-id': 'tenant-123',
    'x-branch-id': 'branch-101',
    'x-user-role': 'BRANCH_ADMIN',
    'x-user-id': 'admin-user'
};

async function runTests() {
    console.log('\n--- Starting Phase 14 Timetable Logic Verification ---\n');

    const session1 = {
        branchId: 'branch-101',
        teacherId: 'teacher-cloning-test',
        classroomId: 'room-cloning-test',
        subjectId: 'math-101',
        dayOfWeek: 'MONDAY',
        startTime: 540,
        endTime: 600
    };

    const session2 = {
        ...session1,
        classroomId: 'room-other-101'
    };

    try {
        // 1. Create First Session
        console.log('1. Creating Base Session (Teacher A @ 09:00 in Room 1)...');
        const res1 = await fetch(`${API_URL}/timetable/sessions`, {
            method: 'POST',
            headers: HEADERS_ADMIN,
            body: JSON.stringify(session1)
        });

        if (!res1.ok) {
            const txt = await res1.text();
            throw new Error(`Failed to create base session: ${res1.status} ${txt}`);
        }
        console.log('   ✅ Session 1 Created.');

        // 2. Attempt Cloning (Conflict)
        console.log('2. Attempting to Clone Teacher A into Room 2 @ 09:00...');
        const res2 = await fetch(`${API_URL}/timetable/sessions`, {
            method: 'POST',
            headers: HEADERS_ADMIN,
            body: JSON.stringify(session2)
        });

        if (res2.status === 409) {
            const err = await res2.json();
            console.log('   ✅ BLOCKED: API returned 409 Conflict.');
            console.log('   Error Details:', err.details);
        } else {
            console.log(`   ❌ FAILED: API Status ${res2.status} (Expected 409)`);
            if (res2.ok) console.log('   Double booking was ALLOWED!');
            process.exit(1);
        }

    } catch (error) {
        console.error('Test Failed:', error.message);
        process.exit(1);
    }
}

runTests();
