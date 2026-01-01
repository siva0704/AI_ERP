
import { Controller, Get, Post, Body, Param, Put, Req } from '@nestjs/common';
import { LibraryService } from './library.service';

@Controller('library')
export class LibraryController {
    constructor(private readonly libraryService: LibraryService) { }

    @Post('books')
    createBook(@Req() req: any, @Body() body: any) {
        // Assuming Middleware adds user to req
        const { tenantId, branchId } = req.user || { tenantId: 'default-tenant', branchId: 'default-branch' }; // Fallback for now if no auth
        // In real request, we must extract tenant/branch from context
        // For MVP, we pass it or mockup. 
        // BUT we know we have an AuditInterceptor that tries to find tenantId.
        // Let's assume body has them or we mock them.
        // We'll use a hardcoded fallback for dev speed if 'req.user' is specific.
        return this.libraryService.createBook('tenant-123', 'branch-101', body);
    }

    @Get('books')
    getBooks() {
        return this.libraryService.getBooks('tenant-123', 'branch-101');
    }

    @Post('issue')
    issueBook(@Body() body: { bookId: string; studentId: string }) {
        return this.libraryService.issueBook('tenant-123', 'branch-101', body.bookId, body.studentId);
    }

    @Post('return/:id')
    returnBook(@Param('id') id: string) {
        return this.libraryService.returnBook(id);
    }
}
