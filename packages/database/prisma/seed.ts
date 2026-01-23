
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting Database Seed...');

    // 1. Create Tenant
    const tenant = await prisma.tenant.upsert({
        where: { id: 'tenant-123' },
        update: {},
        create: {
            id: 'tenant-123',
            name: 'Demo International School',
        },
    });
    console.log(`✅ Tenant Created: ${tenant.name}`);

    // 2. Create Branch
    const branch = await prisma.branch.upsert({
        where: { id: 'branch-101' },
        update: {},
        create: {
            id: 'branch-101',
            name: 'Main Campus',
            tenantId: tenant.id,
        },
    });
    console.log(`✅ Branch Created: ${branch.name}`);

    // 3. Create Fee Structures
    const tuitionFee = await prisma.feeStructure.upsert({
        where: { id: 'fee-tuition-annual' },
        update: {},
        create: {
            id: 'fee-tuition-annual',
            name: 'Annual Tuition Fee',
            amount: 5000.00,
            currency: 'USD',
            branchId: branch.id,
        },
    });
    console.log(`✅ Fee Structure Created: ${tuitionFee.name}`);

    const transportFee = await prisma.feeStructure.upsert({
        where: { id: 'fee-transport-std' },
        update: {},
        create: {
            id: 'fee-transport-std',
            name: 'Standard Transport Fee',
            amount: 150.00,
            currency: 'USD',
            branchId: branch.id,
        },
    });
    console.log(`✅ Fee Structure Created: ${transportFee.name}`);

    // 4. Create Library Books (Initial Catalog)
    // 4. Create Library Books (Initial Catalog)
    const books = [
        {
            title: 'The Great Gatsby',
            author: 'F. Scott Fitzgerald',
            isbn: '978-0743273565',
            status: 'AVAILABLE',
            tenantId: tenant.id,
            branchId: branch.id
        },
        {
            title: '1984',
            author: 'George Orwell',
            isbn: '978-0451524935',
            status: 'AVAILABLE',
            tenantId: tenant.id,
            branchId: branch.id
        },
        {
            title: 'To Kill a Mockingbird',
            author: 'Harper Lee',
            isbn: '978-0061120084',
            status: 'AVAILABLE',
            tenantId: tenant.id,
            branchId: branch.id
        }
    ];

    for (const book of books) {
        const existing = await prisma.libraryBook.findFirst({
            where: { isbn: book.isbn, tenantId: tenant.id }
        });

        if (!existing) {
            await prisma.libraryBook.create({
                data: book
            });
        }
    }
    console.log(`✅ Library Catalog Seeded (${books.length} Books)`);

    // 5. Create Academic Structure (Karnataka Standard)
    const classNames = [
        "Class 1", "Class 2", "Class 3", "Class 4", "Class 5",
        "Class 6", "Class 7", "Class 8", "Class 9", "Class 10",
        "PUC I (Science)", "PUC I (Commerce)", "PUC I (Arts)",
        "PUC II (Science)", "PUC II (Commerce)", "PUC II (Arts)"
    ];

    for (const className of classNames) {
        const existing = await prisma.classroom.findFirst({
            where: { name: className, branchId: branch.id }
        });

        if (!existing) {
            await prisma.classroom.create({
                data: {
                    name: className,
                    capacity: 40,
                    branchId: branch.id
                }
            });
        }
    }
    console.log(`✅ Classrooms Seeded (${classNames.length} Classes)`);

    const subjects = [
        { name: "Kannada", code: "KAN-L1" },
        { name: "English", code: "ENG-L2" },
        { name: "Hindi", code: "HIN-L3" },
        { name: "Mathematics", code: "MAT" },
        { name: "Science", code: "SCI" },
        { name: "Social Science", code: "SOC" },
        { name: "Physics", code: "PHY" },
        { name: "Chemistry", code: "CHE" },
        { name: "Biology", code: "BIO" },
        { name: "Computer Science", code: "CS" },
        { name: "Accountancy", code: "ACC" },
        { name: "Business Studies", code: "BUS" },
        { name: "Economics", code: "ECO" },
    ];

    for (const sub of subjects) {
        const existing = await prisma.subject.findFirst({
            where: { code: sub.code, branchId: branch.id }
        });

        if (!existing) {
            await prisma.subject.create({
                data: {
                    name: sub.name,
                    code: sub.code,
                    branchId: branch.id
                }
            });
        }
    }
    console.log(`✅ Subjects Seeded (${subjects.length} Subjects)`);

    console.log('🌱 Seed Complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
