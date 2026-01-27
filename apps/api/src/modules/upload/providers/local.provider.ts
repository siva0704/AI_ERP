import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { StorageProvider } from './storage.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LocalStorageProvider implements StorageProvider {
    private readonly logger = new Logger(LocalStorageProvider.name);
    private readonly uploadDir = path.resolve('./uploads');

    constructor(private configService: ConfigService) {
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }

    async upload(file: Express.Multer.File, key?: string): Promise<{ url: string; key: string }> {
        const filename = key || `${Date.now()}-${file.originalname}`;
        const filePath = path.join(this.uploadDir, filename);

        fs.writeFileSync(filePath, file.buffer);
        this.logger.log(`File saved locally at ${filePath}`);

        const baseUrl = this.configService.get<string>('API_URL') || 'http://localhost:3001/api';
        // Assuming we serve static files or have a controller to proxy
        // For now, let's assume we serve via a controller endpoint /uploads/:filename
        return {
            url: `${baseUrl}/upload/${filename}`, // Matching current controller likely
            key: filename,
        };
    }

    async delete(key: string): Promise<void> {
        const filePath = path.join(this.uploadDir, key);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }

    getUrl(key: string): string {
        const baseUrl = this.configService.get<string>('API_URL') || 'http://localhost:3001/api';
        return `${baseUrl}/upload/${key}`;
    }
}
