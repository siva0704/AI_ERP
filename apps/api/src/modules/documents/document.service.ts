import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GlobalContextService } from '../../common/context/global-context.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DocumentService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly context: GlobalContextService,
        private readonly configService: ConfigService,
    ) { }

    async saveMetadata(data: { title: string, url: string, type: string, description?: string }) {
        if (this.configService.get('MOCK_MODE')) {
            console.log('MOCK_MODE: Skipping Document Metadata Save', data);
            return {
                id: 'mock-doc-id-' + Date.now(),
                ...data,
                ownerId: 'mock-user-id',
                branchId: 'mock-branch-id',
                createdAt: new Date(),
                updatedAt: new Date(),
            };
        }

        const userId = this.context.userId || 'demo-user'; // Fallback for now
        const branchId = this.context.branchId;

        // Ensure user exists if it's the fallback demo-user
        if (userId === 'demo-user') {
            const userExists = await this.prisma.user.findUnique({ where: { id: 'demo-user' } });
            if (!userExists) {
                // Create a dummy user for development if missing
                await this.prisma.user.create({
                    data: {
                        id: 'demo-user',
                        email: 'demo@example.com',
                        role: 'ADMIN',
                        password: 'password' // Insecure, dev only
                    }
                });
            }
        }

        return this.prisma.document.create({
            data: {
                ...data,
                owner: {
                    connect: { id: userId }
                },
                branch: branchId ? { connect: { id: branchId } } : undefined
            }
        });
    }
    async deleteDocument(id: string) {
        return this.prisma.document.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
    }
}

