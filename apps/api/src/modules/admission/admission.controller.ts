import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';
import { AdmissionService } from './admission.service';
import { GlobalContextService } from '../../common/context/global-context.service';

@Controller('admissions')
export class AdmissionController {
    constructor(
        private readonly admissionService: AdmissionService,
        private readonly globalContext: GlobalContextService,
    ) { }

    @Post()
    async admitStudent(@Body() body: any) { // TODO: DTO
        // branchId is injected via GlobalContext automatically in Service if we use it, 
        // or we pass it explicitly.
        // For now, let's assume we extract it from context or body for MVP if Context Middleware isn't active yet.
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
