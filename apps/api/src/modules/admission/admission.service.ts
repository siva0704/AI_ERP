import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { GlobalContextService } from '../../common/context/global-context.service';
import { CreateAdmissionDto } from './dto/create-admission.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdmissionService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly context: GlobalContextService,
        private readonly configService: ConfigService
    ) { }

    async admitStudent(dto: CreateAdmissionDto) {
        if (this.configService.get('MOCK_MODE')) {
            return {
                status: 'success',
                message: 'Student admitted successfully (MOCK)',
                data: {
                    studentId: 'mock-student-id',
                    userId: 'mock-user-id',
                    enrollmentNo: 'ENR-MOCK'
                }
            };
        }

        return this.prisma.$transaction(async (tx: any) => {
            const branchId = this.context.branchId || 'branch-101';

            // 1. Check for Duplicate Email
            const existingUser = await tx.user.findUnique({
                where: { email: dto.email }
            });

            if (existingUser) {
                throw new ConflictException(`User with email ${dto.email} already exists.`);
            }

            // 2. Create User Account
            const user = await tx.user.create({
                data: {
                    email: dto.email,
                    role: 'STUDENT',
                    branch: { connect: { id: branchId } },
                    password: 'password123' // Default password
                }
            });

            // 3. Create Student Profile
            const student = await tx.studentProfile.create({
                data: {
                    user: { connect: { id: user.id } },
                    branch: { connect: { id: branchId } },
                    firstName: dto.firstName,
                    lastName: dto.lastName,
                    enrollmentNo: dto.enrollmentNo || `ENR-${Date.now()}`,
                    status: 'ACTIVE',

                    // New Fields
                    gender: dto.gender,
                    dob: dto.dob ? new Date(dto.dob) : undefined,
                    bloodGroup: dto.bloodGroup,
                    addressLine1: dto.addressLine1,
                    city: dto.city,
                    state: dto.state,
                    zipCode: dto.zipCode,
                    previousSchool: dto.previousSchool,
                    gradeLevel: dto.gradeLevel
                }
            });

            // 4. Create Initial Fee Ledger (Admission Fee)
            const feeAmount = dto.admissionFee || 500.00;
            await tx.feeLedger.create({
                data: {
                    studentId: student.id,
                    branchId: branchId,
                    type: 'DUE',
                    amount: feeAmount,
                    description: 'Admission & Processing Fee',
                    status: 'PENDING'
                }
            });

            // 5. Link Documents (if any)
            if (dto.documents && dto.documents.length > 0) {
                await tx.document.updateMany({
                    where: { id: { in: dto.documents } },
                    data: { ownerId: user.id }
                });
            }

            return {
                status: 'success',
                message: 'Student admitted successfully',
                data: {
                    studentId: student.id,
                    userId: user.id,
                    enrollmentNo: student.enrollmentNo
                }
            };
        }).catch((error: any) => {
            console.error('CRITICAL ADMISSION ERROR:', error);
            console.error('Stack:', error.stack);
            throw new ConflictException(error.message);
        });
    }

    async promoteStudent(studentId: string, targetClassGroup: string) {
        return { message: "Student promoted successfully (MOCK)", studentId, targetClassGroup };
    }

    async issueTransferCertificate(studentId: string) {
        return { message: "Transfer Certificate issued (MOCK)", studentId, status: 'TRANSFERRED' };
    }

    async getStudents() {
        if (this.configService.get('MOCK_MODE')) {
            return [
                { id: '1', firstName: 'John', lastName: 'Doe', enrollmentNo: 'S101', status: 'ACTIVE', user: { email: 'john@example.com' } },
                { id: '2', firstName: 'Jane', lastName: 'Smith', enrollmentNo: 'S102', status: 'ACTIVE', user: { email: 'jane@example.com' } }
            ];
        }

        // Fetch real data from DB
        const students = await this.prisma.studentProfile.findMany({
            include: {
                user: {
                    select: { email: true }
                }
            },
            orderBy: {
                firstName: 'asc'
            }
        });

        return students;
    }
}
