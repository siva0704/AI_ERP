
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
    // 5. Create Academic Structure (Karnataka State Board)
    // Primary (1-5), Higher (6-10), PUC (11-12)

    const levels = [
        { name: "Class 1", stage: "PRIMARY" }, { name: "Class 2", stage: "PRIMARY" },
        { name: "Class 3", stage: "PRIMARY" }, { name: "Class 4", stage: "PRIMARY" },
        { name: "Class 5", stage: "PRIMARY" },
        { name: "Class 6", stage: "HIGHER" }, { name: "Class 7", stage: "HIGHER" },
        { name: "Class 8", stage: "HIGHER" }, { name: "Class 9", stage: "HIGHER" },
        { name: "Class 10", stage: "HIGHER" },
        { name: "PUC I (Science)", stage: "PUC_SCI" },
        { name: "PUC I (Commerce)", stage: "PUC_COM" },
        { name: "PUC I (Arts)", stage: "PUC_ARTS" },
        { name: "PUC II (Science)", stage: "PUC_SCI" },
        { name: "PUC II (Commerce)", stage: "PUC_COM" },
        { name: "PUC II (Arts)", stage: "PUC_ARTS" }
    ];

    for (const lvl of levels) {
        const existing = await prisma.classroom.findFirst({
            where: { name: lvl.name, branchId: branch.id }
        });

        if (!existing) {
            await prisma.classroom.create({
                data: {
                    name: lvl.name,
                    capacity: 40,
                    branchId: branch.id
                }
            });
        }
    }
    console.log(`✅ Classrooms Seeded (${levels.length} Classes)`);

    // Define Subjects by Stage
    const primarySubjects = [
        { name: "Kannada", code: "KAN-PRI" },
        { name: "English", code: "ENG-PRI" },
        { name: "Mathematics", code: "MAT-PRI" },
        { name: "Environmental Science", code: "EVS-PRI" }
    ];

    const higherSubjects = [
        { name: "Kannada", code: "KAN-HIG" },
        { name: "English", code: "ENG-HIG" },
        { name: "Hindi", code: "HIN-HIG" },
        { name: "Mathematics", code: "MAT-HIG" },
        { name: "Science", code: "SCI-HIG" },
        { name: "Social Science", code: "SOC-HIG" }
    ];

    const pucScienceSubjects = [
        { name: "Physics", code: "PHY-PUC" },
        { name: "Chemistry", code: "CHE-PUC" },
        { name: "Mathematics", code: "MAT-PUC" },
        { name: "Biology", code: "BIO-PUC" },
        { name: "Computer Science", code: "CS-PUC" },
        { name: "English", code: "ENG-PUC" }
    ];

    const pucCommerceSubjects = [
        { name: "Accountancy", code: "ACC-PUC" },
        { name: "Business Studies", code: "BUS-PUC" },
        { name: "Economics", code: "ECO-PUC" },
        { name: "Computer Science", code: "CS-COM-PUC" },
        { name: "English", code: "ENG-PUC" }
    ];

    const pucArtsSubjects = [
        { name: "History", code: "HIS-PUC" },
        { name: "Political Science", code: "POL-PUC" },
        { name: "Sociology", code: "SOC-PUC" },
        { name: "Economics", code: "ECO-PUC" },
        { name: "English", code: "ENG-PUC" }
    ];

    const allSubjects = [
        ...primarySubjects,
        ...higherSubjects,
        ...pucScienceSubjects,
        ...pucCommerceSubjects,
        ...pucArtsSubjects
    ];

    // Deduplicate by code
    const uniqueSubjects = Array.from(new Map(allSubjects.map(s => [s.code, s])).values());

    for (const sub of uniqueSubjects) {
        // Upsert to ensure we can update names if codes exist, or skip if exists
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
    console.log(`✅ Subjects Seeded (${uniqueSubjects.length} Unique Subjects)`);

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
