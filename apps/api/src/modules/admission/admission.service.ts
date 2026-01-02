import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { GlobalContextService } from '../../common/context/global-context.service';

@Injectable()
export class AdmissionService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly context: GlobalContextService,
    ) { }

    async admitStudent(data: any) {
        // Mock Implementation
        return {
            id: 'mock-student-id-1',
            firstName: data.firstName || 'John',
            lastName: data.lastName || 'Doe',
            enrollmentNo: data.enrollmentNo || 'ENR123',
            status: 'ACTIVE',
            message: 'Student admitted successfully (MOCK)'
        };
    }

    async promoteStudent(studentId: string, targetClassGroup: string) {
        return { message: "Student promoted successfully (MOCK)", studentId, targetClassGroup };
    }

    async issueTransferCertificate(studentId: string) {
        return { message: "Transfer Certificate issued (MOCK)", studentId, status: 'TRANSFERRED' };
    }

    async getStudents() {
        // Mock Data
        return [
            { id: '1', firstName: 'Alice', lastName: 'Smith', enrollmentNo: 'A101', status: 'ACTIVE', user: { email: 'alice@example.com' } },
            { id: '2', firstName: 'Bob', lastName: 'Jones', enrollmentNo: 'A102', status: 'ACTIVE', user: { email: 'bob@example.com' } },
            { id: '3', firstName: 'Charlie', lastName: 'Brown', enrollmentNo: 'A103', status: 'INACTIVE', user: { email: 'charlie@example.com' } }
        ];
    }
}
