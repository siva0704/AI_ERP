import { z } from 'zod';

export const envSchema = z.object({
    // Core
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().default(3001),

    // Database
    DATABASE_URL: z.string().url().startsWith('postgresql://'),

    // Security
    JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters long'),

    // AI (Optional for now, but strict if provided)
    OPENAI_API_KEY: z.string().optional(),

    // Feature Flags
    MOCK_MODE: z.coerce.boolean().default(false),

    // Storage
    STORAGE_DRIVER: z.enum(['local', 's3']).default('local'),
    S3_BUCKET: z.string().optional(),
    S3_REGION: z.string().optional(),
    S3_ENDPOINT: z.string().optional(),
    AWS_ACCESS_KEY_ID: z.string().optional(),
    AWS_SECRET_ACCESS_KEY: z.string().optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validate(config: Record<string, unknown>) {
    const result = envSchema.safeParse(config);

    if (!result.success) {
        console.error('❌ Invalid environment variables:', result.error.format());
        process.exit(1);
    }

    return result.data;
}
