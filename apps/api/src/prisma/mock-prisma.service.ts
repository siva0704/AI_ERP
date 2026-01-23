import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class MockPrismaService implements OnModuleInit {
    private db = {
        users: [] as any[],
        studentProfiles: [] as any[],
        feeLedgers: [] as any[]
    };

    async onModuleInit() {
        console.log('------------------------------------------------');
        console.log('   MOCK PRISMA SERVICE INITIALIZED (NO DB)      ');
        console.log('------------------------------------------------');
    }

    // Mock $transaction
    async $transaction(callback: (tx: any) => Promise<any>) {
        return callback(this);
    }

    // Mock User Delegate
    user = {
        findUnique: async ({ where }: { where: { email: string } }) => {
            return this.db.users.find(u => u.email === where.email) || null;
        },
        create: async ({ data }: { data: any }) => {
            const newUser = { id: `user-${Date.now()}`, ...data };
            this.db.users.push(newUser);
            return newUser;
        },
        findMany: async () => this.db.users
    };

    // Mock StudentProfile Delegate
    studentProfile = {
        create: async ({ data }: { data: any }) => {
            const newStudent = { id: `student-${Date.now()}`, ...data };
            this.db.studentProfiles.push(newStudent);
            return newStudent;
        },
        findMany: async (args?: any) => {
            // Basic support for include (mocked by just returning the object)
            // In a real mock we would join data, but for MVP list view this is fine.
            return this.db.studentProfiles.map(student => {
                if (args?.include?.user) {
                    const user = this.db.users.find(u => u.id === student.userId);
                    return { ...student, user };
                }
                return student;
            });
        }
    };

    // Mock FeeLedger Delegate
    feeLedger = {
        create: async ({ data }: { data: any }) => {
            const newFee = { id: `fee-${Date.now()}`, ...data };
            this.db.feeLedgers.push(newFee);
            return newFee;
        }
    };

    getExtendedClient() {
        return this;
    }

    // --- TRANSPORT MOCKS ---
    transportRoute = {
        create: async ({ data }: { data: any }) => {
            return { id: `route-${Date.now()}`, ...data };
        },
        findMany: async () => [
            { id: 'route-1', name: 'Route A', vehicleId: 'bus-1', monthlyCost: 100, vehicle: { number: 'BUS-01' } },
            { id: 'route-2', name: 'Route B', vehicleId: 'bus-2', monthlyCost: 120, vehicle: { number: 'BUS-02' } }
        ],
        findUnique: async ({ where }: { where: { id: string } }) => {
            return { id: where.id, name: 'Route A', monthlyCost: 100 };
        }
    };
    transportAllocation = {
        create: async ({ data }: { data: any }) => ({ id: `alloc-${Date.now()}`, ...data })
    };

    // --- OTHER MOCKS TO PREVENT CRASHES ---
    attendanceRecord = {
        findMany: async () => []
    };
    payrollRun = {
        findMany: async () => [],
        findFirst: async () => null,
        create: async ({ data }: { data: any }) => ({ id: `run-${Date.now()}`, ...data })
    };
    payrollLedger = {
        create: async () => ({})
    };
    staffProfile = {
        findMany: async () => []
    };
    exam = { findMany: async () => [] };
    examResult = { findMany: async () => [] };
    libraryBook = { findMany: async () => [] };
    libraryIssue = { findMany: async () => [] };
    timetableBlock = { findMany: async () => [] };
    timetableSession = { findMany: async () => [] };
    notification = { create: async () => ({}) };
    document = { updateMany: async () => ({}) };
}
