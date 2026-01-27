import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageProvider } from './providers/storage.interface';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { LocalStorageProvider } from './providers/local.provider';
import { S3StorageProvider } from './providers/s3.provider';

@Module({
    controllers: [UploadController],
    providers: [
        UploadService,
        LocalStorageProvider,
        S3StorageProvider,
        {
            provide: StorageProvider,
            useFactory: (configService: ConfigService, local: LocalStorageProvider, s3: S3StorageProvider) => {
                const driver = configService.get('STORAGE_DRIVER') || 'local';
                return driver === 's3' ? s3 : local;
            },
            inject: [ConfigService, LocalStorageProvider, S3StorageProvider],
        },
    ],
    exports: [UploadService],
})
export class UploadModule { }
