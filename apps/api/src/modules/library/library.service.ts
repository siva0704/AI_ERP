
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LibraryService {
    constructor(
        private prisma: PrismaService,
        private configService: ConfigService
    ) { }

    async createBook(tenantId: string, branchId: string, data: any) {
        return this.prisma.libraryBook.create({
            data: { ...data, tenantId, branchId },
        });
    }

    async getBooks(tenantId: string, branchId: string) {
        if (this.configService.get('MOCK_MODE')) {
            return [
                { id: '1', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', status: 'AVAILABLE', isbn: '978-0743273565' },
                { id: '2', title: '1984', author: 'George Orwell', status: 'ISSUED', isbn: '978-0451524935' },
                { id: '3', title: 'To Kill a Mockingbird', author: 'Harper Lee', status: 'AVAILABLE', isbn: '978-0061120084' }
            ];
        }
        return this.prisma.libraryBook.findMany({
            where: { tenantId, branchId },
        });
    }

    async issueBook(tenantId: string, branchId: string, bookId: string, studentId: string) {
        // 0. Check Max Books Limit (Constraint: Max 2)
        const activeIssues = await this.prisma.bookIssue.count({
            where: {
                studentId,
                returnDate: null
            }
        });
        if (activeIssues >= 2) {
            throw new BadRequestException('Student has reached the maximum limit of 2 issued books.');
        }

        // 1. Check if book available
        const book = await this.prisma.libraryBook.findUnique({ where: { id: bookId } });
        if (!book || book.status !== 'AVAILABLE') throw new NotFoundException('Book not available');

        // 2. Issue
        const issue = await this.prisma.bookIssue.create({
            data: {
                tenantId, branchId, bookId, studentId,
                issueDate: new Date(),
                dueDate: new Date(new Date().setDate(new Date().getDate() + 14)), // 2 Weeks
            },
        });

        // 3. Update Book Status
        await this.prisma.libraryBook.update({
            where: { id: bookId },
            data: { status: 'ISSUED' },
        });

        return issue;
    }

    async getActiveIssues(tenantId: string, branchId: string) {
        if (this.configService.get('MOCK_MODE')) {
            const now = new Date();
            const dueDate = new Date();
            dueDate.setDate(now.getDate() + 14);
            return [
                {
                    id: 'issue-1',
                    book: { title: '1984', author: 'George Orwell' },
                    student: { firstName: 'John', lastName: 'Doe', enrollmentNo: 'S123' },
                    issueDate: now,
                    dueDate: dueDate
                }
            ];
        }

        return this.prisma.bookIssue.findMany({
            where: {
                tenantId,
                branchId,
                returnDate: null,
            },
            include: {
                book: true,
                student: true,
            },
        });
    }



    async returnBook(issueId: string) {
        const issue = await this.prisma.bookIssue.findUnique({
            where: { id: issueId },
            include: { book: true, student: true },
        });
        if (!issue) throw new NotFoundException('Issue not found');

        const returnDate = new Date();
        let fine = 0;

        // Calculate Fine
        if (returnDate > issue.dueDate) {
            const diffTime = Math.abs(returnDate.getTime() - issue.dueDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            fine = diffDays * 5; // $5 per day
        }

        // Update Issue
        await this.prisma.bookIssue.update({
            where: { id: issueId },
            data: { returnDate, fineAmount: fine },
        });

        // Update Book
        await this.prisma.libraryBook.update({
            where: { id: issue.bookId },
            data: { status: 'AVAILABLE' },
        });

        // Inject Fine to Fee Ledger if Fine > 0
        if (fine > 0 && issue.studentId) {
            await this.prisma.feeLedger.create({
                data: {

                    branchId: issue.branchId,
                    studentId: issue.studentId,
                    description: `Library Fine: ${issue.book.title} (${fine} days late)`,
                    amount: fine,
                    type: 'DUE',
                    status: 'PENDING',
                },
            });
        }

        return { message: 'Returned', fine };
    }
}
