// Native fetch in Node 18+

const API_URL = 'http://localhost:3001/api/assistant/query';

async function testQuery(role, query) {
    console.log(`\n🤖 Asking (${role}): "${query}"`);
    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-user-role': role, // Mock Context Middleware
                'x-branch-id': 'branch-01'
            },
            body: JSON.stringify({ query })
        });

        if (!res.ok) {
            const err = await res.text();
            console.error(`❌ Error ${res.status}: ${err}`);
            return;
        }

        const data = await res.json();
        console.log(`✅ AI Response: "${data.content}"`);
    } catch (error) {
        console.error('❌ Connection Failed:', error.message);
    }
}

async function run() {
    console.log('🧠 Verifying AI Assistant...');

    // 1. Revenue Query
    await testQuery('GROUP_ADMIN', 'What is the total revenue?');

    // 2. Student Count
    await testQuery('BRANCH_ADMIN', 'How many students do we have?');

    // 3. Pending Fees
    await testQuery('STAFF', 'Show me pending fees');

    // 4. Unknown Query
    await testQuery('GROUP_ADMIN', 'What is the capital of Mars?');
}

run();
