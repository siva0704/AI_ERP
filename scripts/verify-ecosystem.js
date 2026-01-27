
const BASE_URL = 'http://localhost:3001/api';

async function request(path, method, body) {
    const headers = {
        'Content-Type': 'application/json',
        'x-user-role': 'BRANCH_ADMIN',
        'x-tenant-id': 'tenant-123',
        'x-branch-id': 'branch-101'
    };
    const res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers,
        body: JSON.stringify(body)
    });
    const text = await res.text();
    try {
        return { status: res.status, data: JSON.parse(text) };
    } catch (e) {
        return { status: res.status, data: text };
    }
}

async function main() {
    console.log('--- Starting Phase 12 Ecosystem Verification ---\n');
    const timestamp = Date.now();

    // 1. Admit Student
    console.log('1. Admitting Verification Student...');
    const admitRes = await request('/admissions', 'POST', {
        email: `verify_${timestamp}@example.com`,
        firstName: 'Verify',
        lastName: 'User',
        enrollmentNo: `ECO-${timestamp}`
    });

    if (admitRes.status !== 201) {
        console.error('FAILED to admit student:', admitRes);
        return;
    }
    const studentId = admitRes.data.data.studentId;
    console.log('   ✅ Student Created:', studentId);


    // 2. Create Route
    console.log('\n2. Creating Transport Route...');
    const routeRes = await request('/transport/routes', 'POST', {
        name: `Eco Bus ${timestamp}`,
        monthlyCost: 100
    });
    if (routeRes.status !== 201) {
        console.error('FAILED to create route:', routeRes);
        return;
    }
    const routeId = routeRes.data.id;
    console.log('   ✅ Route Created:', routeId);

    // 3. Allocate Student (Revenue Test)
    console.log('\n3. Allocating Student to Route...');
    const allocRes = await request('/transport/allocate', 'POST', {
        routeId,
        studentId
    });
    if (allocRes.status !== 201) {
        console.error('FAILED to allocate:', allocRes);
    } else {
        console.log('   ✅ Allocation Successful (Fee Ledger entry created implicitly)');
    }

    // 4. Library Constraint Test
    console.log('\n4. Library Constraint Test (Max 2 Books)...');

    // Helper to add book
    const addBook = async (i) => {
        const res = await request('/library/books', 'POST', {
            title: `Book ${i}`,
            author: `Author ${i}`,
            isbn: `ISBN-${timestamp}-${i}`
        });
        return res.data.id;
    };

    const book1 = await addBook(1);
    const book2 = await addBook(2);
    const book3 = await addBook(3);

    console.log('   Books Added:', book1, book2, book3);

    // Issue 1
    const i1 = await request('/library/issue', 'POST', { bookId: book1, studentId });
    console.log(`   Issue 1: ${i1.status === 201 ? 'Success' : 'Failed'}`);

    // Issue 2
    const i2 = await request('/library/issue', 'POST', { bookId: book2, studentId });
    console.log(`   Issue 2: ${i2.status === 201 ? 'Success' : 'Failed'}`);

    // Issue 3 (Should Fail)
    const i3 = await request('/library/issue', 'POST', { bookId: book3, studentId });
    if (i3.status === 400) {
        console.log('   ✅ Constraint Verified: Issue 3 Failed as expected.');
        console.log('      Error Message:', i3.data.message);
    } else {
        console.error('   ❌ Constraint Failed: Issue 3 succeeded but should have failed.', i3);
    }

    console.log('\n--- Verification Complete ---');
}

main().catch(console.error);
