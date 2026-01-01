import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

process.env.DATABASE_URL = 'postgresql://postgres:9896@127.0.0.1:5432/postgres?schema=public';

const prisma = new PrismaClient();

async function main() {
    const sql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf-8');
    console.log('Running SQL...');
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
