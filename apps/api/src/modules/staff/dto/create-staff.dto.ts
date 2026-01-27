
import { IsString, IsEmail, IsNotEmpty, IsOptional, ValidateIf, IsEnum, IsNumber, Min } from 'class-validator';

export class CreateStaffDto {
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @IsEnum(['TEACHER', 'DRIVER', 'ADMIN', 'SUPPORT'], { message: 'Role must be TEACHER, DRIVER, ADMIN, or SUPPORT' })
    role: string;

    // Banking & Compliance
    @IsString()
    @IsNotEmpty()
    panNumber: string;

    @IsString()
    @IsNotEmpty()
    bankAccountNo: string;

    @IsString()
    @IsNotEmpty()
    ifscCode: string; // Used as bankIfsc

    // Teacher Specific
    @ValidateIf(o => o.role === 'TEACHER')
    @IsString()
    @IsNotEmpty()
    qualification?: string;

    @ValidateIf(o => o.role === 'TEACHER')
    @IsNumber()
    @Min(0)
    experienceYears?: number;

    // Driver Specific
    @ValidateIf(o => o.role === 'DRIVER')
    @IsString()
    @IsNotEmpty()
    licenseNumber?: string;

    @ValidateIf(o => o.role === 'DRIVER')
    @IsString()
    @IsNotEmpty()
    licenseExpiry?: string; // ISO Date String

    @ValidateIf(o => o.role === 'DRIVER')
    @IsString()
    @IsNotEmpty()
    badgeNumber?: string;

    // Common
    @IsString()
    @IsNotEmpty()
    emergencyContactName: string;

    @IsString()
    @IsNotEmpty()
    emergencyContactPhone: string;
}
