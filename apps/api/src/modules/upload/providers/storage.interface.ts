export abstract class StorageProvider {
    abstract upload(file: Express.Multer.File, key?: string): Promise<{ url: string; key: string }>;
    abstract delete(key: string): Promise<void>;
    abstract getUrl(key: string): string;
}
