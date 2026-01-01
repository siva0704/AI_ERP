const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: 'postgresql://postgres:9896@127.0.0.1:5432/postgres?schema=public',
        },
    },
});

async function main() {
    const sql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf-8');
    console.log('Running SQL...');
    // Split by semicolon to run statements individually if needed, or executeRawUnsafe supports multiple?
    // executeRawUnsafe might fail on multiple statements depending on driver.
    // Best to split.
    const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);

    for (const stmt of statements) {
        if (stmt) {
            await prisma.$executeRawUnsafe(stmt);
        }
    }
    console.log('Seed executed successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
