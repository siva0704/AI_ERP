
import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
    constructor(private readonly uploadService: UploadService) { }

    @Post()
    @UseInterceptors(FileInterceptor('file', {
        limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
        fileFilter: (req, file, callback) => {
            if (!file.originalname.match(/\.(jpg|jpeg|png|pdf)$/)) {
                return callback(new BadRequestException('Only PDF, JPG, and PNG are allowed!'), false);
            }
            callback(null, true);
        }
    }))
    async uploadFile(@UploadedFile() file: Express.Multer.File) {
        return this.uploadService.uploadFile(file);
    }
}
