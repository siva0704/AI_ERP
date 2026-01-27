
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const defaultBranch = await prisma.branch.findUnique({ where: { id: 'default-branch' } });
    console.log('Default Branch:', defaultBranch);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
