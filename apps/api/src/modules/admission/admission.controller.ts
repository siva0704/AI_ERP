import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AdmissionService } from './admission.service';
import { GlobalContextService } from '../../common/context/global-context.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

import { CreateAdmissionDto } from './dto/create-admission.dto';

@Controller('admissions')
@UseGuards(RolesGuard)
export class AdmissionController {
    constructor(
        private readonly admissionService: AdmissionService,
        private readonly globalContext: GlobalContextService,
    ) { }

    @Post()
    @Roles('GROUP_ADMIN', 'BRANCH_ADMIN')
    async admitStudent(@Body() body: CreateAdmissionDto) {
        return this.admissionService.admitStudent(body);
    }
    @Post('promote')
    async promoteStudent(@Body() body: { studentId: string; targetClassGroup: string }) {
        return this.admissionService.promoteStudent(body.studentId, body.targetClassGroup);
    }

    @Post('transfer-cert')
    async issueTransferCertificate(@Body() body: { studentId: string }) {
        return this.admissionService.issueTransferCertificate(body.studentId);
    }
    @Get()
    async getStudents() {
        return this.admissionService.getStudents();
    }
}
