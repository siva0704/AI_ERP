import { Controller, Post, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { AssistantService } from './assistant.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('assistant')
@UseGuards(RolesGuard)
export class AssistantController {
    constructor(private readonly assistantService: AssistantService) { }

    @Post('query')
    @Roles('GROUP_ADMIN', 'BRANCH_ADMIN', 'STAFF') // Students/Parents maybe later
    async query(@Body() body: { query: string }) {
        if (!body.query) throw new BadRequestException('Query is required');
        return this.assistantService.processQuery(body.query);
    }
}
