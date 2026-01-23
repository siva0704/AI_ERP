import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StaffService {
    constructor(private prisma: PrismaService) { }

    async createStaffProfile(data: any) {
        return this.prisma.staffProfile.create({
            data: {
                userId: data.userId,
                branchId: data.branchId,
                firstName: data.firstName || 'Staff',
                lastName: data.lastName || 'Member',
                designation: data.designation,
                department: data.department,
                baseSalary: data.baseSalary,
                joinDate: data.joinDate || new Date(),

                // New Fields
                qualification: data.qualification,
                experienceYears: data.experienceYears ? Number(data.experienceYears) : 0,
                bankAccountNo: data.bankAccountNo,
                bankIfsc: data.bankIfsc,
                emergencyContactName: data.emergencyContactName,
                emergencyContactPhone: data.emergencyContactPhone,
            },
            include: { user: true }
        });
    }

    async getStaffList(branchId: string, search?: string) {
        return this.prisma.staffProfile.findMany({
            where: {
                branchId,
                OR: search ? [
                    { firstName: { contains: search } },
                    { lastName: { contains: search } },
                    { user: { email: { contains: search } } }
                ] : undefined
            },
            include: {
                user: { select: { email: true, role: true } }
            }
        });
    }

    async updateStaffProfile(id: string, branchId: string, data: any) {
        const profile = await this.prisma.staffProfile.findFirst({
            where: { id, branchId }
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
}
