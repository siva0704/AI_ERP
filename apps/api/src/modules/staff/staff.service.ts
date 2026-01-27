import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StaffService {
    constructor(private prisma: PrismaService) { }

    async getStaffProfile(id: string) {
        const profile = await this.prisma.staffProfile.findFirst({
            where: { id, deletedAt: null },
            include: { user: { include: { documents: true } } }
        });
        if (!profile) throw new NotFoundException('Staff not found');
        return profile;
    }

    async createStaffProfile(data: any) {
        return this.prisma.$transaction(async (tx) => {
            // 1. Create User
            const user = await tx.user.create({
                data: {
                    email: data.email,
                    role: data.role,
                    branch: { connect: { id: data.branchId } },
                    password: 'password123', // Default
                    provider: 'INTERNAL'
                }
            });

            // 2. Create Profile
            return tx.staffProfile.create({
                data: {
                    userId: user.id,
                    branchId: data.branchId,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    designation: 'Staff',
                    department: 'General',
                    baseSalary: 0,
                    joinDate: new Date(),

                    // New Fields
                    qualification: data.qualification,
                    experienceYears: data.experienceYears ? Number(data.experienceYears) : 0,
                    bankAccountNo: data.bankAccountNo,
                    bankIfsc: data.ifscCode,
                    panNumber: data.panNumber,
                    epfNumber: data.epfNumber,
                    emergencyContactName: data.emergencyContactName,
                    emergencyContactPhone: data.emergencyContactPhone,

                    // Driver Specific
                    licenseNumber: data.licenseNumber,
                    badgeNumber: data.badgeNumber,
                    licenseExpiry: data.licenseExpiry ? new Date(data.licenseExpiry) : null,
                },
                include: { user: true }
            });
        });
    }

    async getStaffList(branchId: string, search?: string) {
        return this.prisma.staffProfile.findMany({
            where: {
                branchId,
                deletedAt: null,
                OR: search ? [
                    { firstName: { contains: search } },
                    { lastName: { contains: search } },
                    { user: { email: { contains: search } } }
                ] : undefined
            },
            include: {
                user: { select: { email: true, role: true } },
                // documents: true // If staff documents are linked to staffProfile directly or via User?
                // Schema check: Document has ownerId (User). StaffProfile has userId.
                // So we need to fetch user.documents.
            }
        });
    }

    async updateStaffProfile(id: string, branchId: string, data: any) {
        const profile = await this.prisma.staffProfile.findFirst({
            where: { id, branchId },
            include: { user: { include: { documents: true } } }
        });
        if (!profile) throw new NotFoundException('Staff not found');

        return this.prisma.staffProfile.update({
            where: { id },
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                designation: data.designation,
                department: data.department,
                baseSalary: data.baseSalary,
                qualification: data.qualification,
                experienceYears: data.experienceYears ? Number(data.experienceYears) : undefined,
                bankAccountNo: data.bankAccountNo,
                bankIfsc: data.bankIfsc,
                emergencyContactName: data.emergencyContactName,
                emergencyContactPhone: data.emergencyContactPhone,
            }
        });
    }

    async deleteStaffProfile(id: string) {
        return this.prisma.staffProfile.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
    }
}

