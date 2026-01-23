import { Controller, Post, UseInterceptors, UploadedFile, Body, Get, Param, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentService } from './document.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import type { Response } from 'express';
import * as fs from 'fs';

@Controller('documents')
export class DocumentController {
    constructor(private readonly documentService: DocumentService) {
        // Ensure upload directory exists
        if (!fs.existsSync('./uploads')) {
            fs.mkdirSync('./uploads');
        }
    }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads',
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                cb(null, `${randomName}${extname(file.originalname)}`);
            },
        }),
    }))
    async uploadFile(@UploadedFile() file: Express.Multer.File, @Body() body: { title: string, type: string, description?: string }) {
        if (!file) {
            return { status: 'error', message: 'No file uploaded' };
        }

        const url = `/api/documents/file/${file.filename}`;

        const document = await this.documentService.saveMetadata({
            title: body.title || file.originalname,
            url: url,
            type: body.type || 'OTHER',
            description: body.description
        });

        return document;
    }

    @Get('file/:filename')
    serveFile(@Param('filename') filename: string, @Res() res: Response) {
        res.sendFile(filename, { root: './uploads' });
    }
}
