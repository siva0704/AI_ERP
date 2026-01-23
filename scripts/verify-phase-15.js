const API_URL = 'http://localhost:3001/api';
// Use Admin Headers for Reporting
const HEADERS = {
    'Content-Type': 'application/json',
    'x-tenant-id': 'tenant-123',
    'x-branch-id': 'branch-101',
    'x-user-role': 'BRANCH_ADMIN'
};

async function verifyPhase15() {
    console.log('--- Phase 15: Intelligence & Analytics Verification ---');
    try {
        // 1. KPI Health Check
        console.log('1. Fetching Branch KPI Overview...');
        const res1 = await fetch(`${API_URL}/reporting/branch-overview`, { headers: HEADERS });
        if (!res1.ok) throw new Error(await res1.text());
        const kpis = await res1.json();
        console.log('   Stats:', kpis);
        if (kpis.revenue === undefined) throw new Error('KPI Missing Revenue');

        // 2. Trend Analysis
        console.log('2. Fetching Revenue Trend...');
        const res2 = await fetch(`${API_URL}/reporting/revenue-trend`, { headers: HEADERS });
        const trend = await res2.json();
        console.log('   Trend Data Points:', trend.length);

        // 3. Matrix Analysis
        console.log('3. Fetching Attendance Matrix...');
        const res3 = await fetch(`${API_URL}/reporting/attendance-matrix`, { headers: HEADERS });
        const matrix = await res3.json();
        console.log('   Matrix Rows:', matrix.length);

        // 4. Export Test
        console.log('4. Testing CSV Export Endpoint...');
        const res4 = await fetch(`${API_URL}/reporting/export?type=REVENUE`, { headers: HEADERS });
        if (!res4.ok) throw new Error('Export Failed');
        const csv = await res4.text();
        console.log('   CSV Length:', csv.length, 'bytes');
        if (!csv.startsWith('Date,Student Name')) throw new Error('Invalid CSV Header');

        console.log('✅ Phase 15 Verified: Reporting Engine is LIVE & Exportable.');

    } catch (e) {
        console.error('❌ Phase 15 Verification Failed:', e);
        process.exit(1);
    }
}

verifyPhase15();
