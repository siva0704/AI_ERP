import { Injectable, Logger } from '@nestjs/common';
import { StorageProvider } from './providers/storage.interface';

@Injectable()
export class UploadService {
    private readonly logger = new Logger(UploadService.name);

    constructor(private readonly storageProvider: StorageProvider) { }

    async uploadFile(file: Express.Multer.File): Promise<{ url: string; key: string }> {
        this.logger.log(`Uploading file: ${file.originalname} using ${this.storageProvider.constructor.name}`);
        return this.storageProvider.upload(file);
    }

    async deleteFile(key: string): Promise<void> {
        await this.storageProvider.delete(key);
    }
}
