import { Injectable, Logger } from '@nestjs/common';
import { StorageProvider } from './storage.interface';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class S3StorageProvider implements StorageProvider {
    private readonly logger = new Logger(S3StorageProvider.name);
    private readonly s3Client: S3Client;
    private readonly bucket: string;

    constructor(private configService: ConfigService) {
        this.bucket = this.configService.get<string>('S3_BUCKET') || 'uploads';
        const region = this.configService.get<string>('S3_REGION') || 'us-east-1';
        const endpoint = this.configService.get<string>('S3_ENDPOINT'); // For MinIO

        this.s3Client = new S3Client({
            region,
            endpoint,
            credentials: {
                accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID') || '',
                secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY') || '',
            },
            forcePathStyle: true, // Needed for MinIO
        });
    }

    async upload(file: Express.Multer.File, key?: string): Promise<{ url: string; key: string }> {
        const filename = key || `${Date.now()}-${file.originalname}`;

        await this.s3Client.send(new PutObjectCommand({
            Bucket: this.bucket,
            Key: filename,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: 'public-read', // Or handled by bucket policy
        }));

        this.logger.log(`File uploaded to S3/MinIO: ${filename}`);

        return {
            url: this.getUrl(filename),
            key: filename,
        };
    }

    async delete(key: string): Promise<void> {
        await this.s3Client.send(new DeleteObjectCommand({
            Bucket: this.bucket,
            Key: key,
        }));
    }

    getUrl(key: string): string {
        const endpoint = this.configService.get<string>('S3_ENDPOINT') || '';
        const bucket = this.bucket;
        // Basic construction, might need adjustment for specialized S3 hosts
        if (endpoint.includes('localhost') || endpoint.includes('minio')) {
            // MinIO path style: http://localhost:9000/bucket/key
            return `${endpoint}/${bucket}/${key}`;
        }
        // Standard AWS: https://bucket.s3.region.amazonaws.com/key (simplified)
        return `https://${bucket}.s3.amazonaws.com/${key}`;
    }
}
