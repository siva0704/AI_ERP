import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { LibraryService } from './library.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { RolesGuard } from '../../common/guards/roles.guard';
import { GlobalContextService } from '../../common/context/global-context.service';

@Controller('library')
@UseGuards(RolesGuard)
export class LibraryController {
    constructor(
        private readonly libraryService: LibraryService,
        private readonly context: GlobalContextService
    ) { }

    @Post('books')
    @Roles(Role.BRANCH_ADMIN, Role.STAFF)
    createBook(@Body() body: any) {
        const tenantId = this.context.tenantId;
        const branchId = this.context.branchId;
        if (!tenantId || !branchId) throw new Error('Context missing');
        return this.libraryService.createBook(tenantId, branchId, body);
    }

    @Get('books')
    @Roles(Role.BRANCH_ADMIN, Role.STAFF, Role.STUDENT)
    getBooks() {
        const tenantId = this.context.tenantId;
        const branchId = this.context.branchId;
        if (!tenantId || !branchId) throw new Error('Context missing');
        return this.libraryService.getBooks(tenantId, branchId);
    }

    @Get('issues')
    @Roles(Role.BRANCH_ADMIN, Role.STAFF)
    getActiveIssues() {
        const tenantId = this.context.tenantId;
        const branchId = this.context.branchId;
        if (!tenantId || !branchId) throw new Error('Context missing');
        return this.libraryService.getActiveIssues(tenantId, branchId);
    }

    @Post('issue')
    @Roles(Role.BRANCH_ADMIN, Role.STAFF)
    issueBook(@Body() body: { bookId: string; studentId: string }) {
        const tenantId = this.context.tenantId;
        const branchId = this.context.branchId;
        if (!tenantId || !branchId) throw new Error('Context missing');
        return this.libraryService.issueBook(tenantId, branchId, body.bookId, body.studentId);
    }

    @Post('return/:id')
    @Roles(Role.BRANCH_ADMIN, Role.STAFF)
    returnBook(@Param('id') id: string) {
        return this.libraryService.returnBook(id);
    }
}
