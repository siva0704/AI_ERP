
import { Controller, Get, Post, Body, Param, Req } from '@nestjs/common';
import { TransportService } from './transport.service';

@Controller('transport')
export class TransportController {
    constructor(private readonly transportService: TransportService) { }

    @Post('routes')
    createRoute(@Body() body: any) {
        return this.transportService.createRoute('tenant-123', 'branch-101', body);
    }

    @Get('routes')
    getRoutes() {
        return this.transportService.getRoutes('tenant-123', 'branch-101');
    }

    @Post('allocate')
    allocateStudent(@Body() body: { routeId: string; studentId: string }) {
        return this.transportService.allocateStudent('tenant-123', 'branch-101', body.routeId, body.studentId);
    }
}
