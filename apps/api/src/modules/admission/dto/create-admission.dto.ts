import { IsEmail, IsNotEmpty, IsOptional, IsString, IsNumber, Min } from 'class-validator';

export class CreateAdmissionDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsString()
    @IsOptional()
    enrollmentNo?: string;

    @IsString()
    @IsOptional()
    guardianName?: string;

    @IsString()
    @IsOptional()
    guardianContact?: string;

    @IsNumber()
    @IsOptional()
    @Min(0)
    admissionFee?: number;

    // Demographics
    @IsString()
    @IsOptional()
    gender?: string;

    @IsString()
    @IsOptional()
    dob?: string;

    @IsString()
    @IsOptional()
    bloodGroup?: string;

    // Address
    @IsString()
    @IsOptional()
    addressLine1?: string;

    @IsString()
    @IsOptional()
    city?: string;

    @IsString()
    @IsOptional()
    state?: string;

    @IsString()
    @IsOptional()
    zipCode?: string;

    // Academic
    @IsString()
    @IsOptional()
    previousSchool?: string;

    @IsString()
    @IsOptional()
    gradeLevel?: string;

    @IsString({ each: true })
    @IsOptional()
    documents?: string[];

    // Phase 20 New Fields
    @IsString()
    @IsOptional()
    motherTongue?: string;

    @IsString()
    @IsOptional()
    guardianRelation?: string;

    @IsString()
    @IsOptional()
    secondLanguage?: string;

    @IsString()
    @IsOptional()
    thirdLanguage?: string;

    @IsString()
    @IsOptional()
    classroomId?: string;

    @IsString()
    @IsOptional()
    religion?: string;

    @IsString()
    @IsOptional()
    casteCategory?: string;

    @IsString()
    @IsOptional()
    nationality?: string;

    @IsString()
    @IsOptional()
    aadhaarNo?: string;

    @IsString()
    @IsOptional()
    satsId?: string;

    @IsString()
    @IsOptional()
    allergies?: string;

    @IsString()
    @IsOptional()
    pincode?: string;
}
