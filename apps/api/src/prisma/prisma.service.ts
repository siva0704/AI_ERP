import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { GlobalContextService } from '../common/context/global-context.service';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    constructor(
        private readonly context: GlobalContextService,
    ) {
        super({
            log: ['info', 'warn', 'error'],
        });
    }

    async onModuleInit() {
        if (process.env.MOCK_MODE === 'true') {
            console.log('WARN: PrismaService instantiated even though MOCK_MODE=true. Skipping connection.');
            return;
        }
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }

    // Wrapper to get an RLS-enabled client
    getExtendedClient() {
        return this.$extends({
            query: {
                $allModels: {
                    async $allOperations({ args, query }: { args: any, query: any }) {
                        // Access the global AsyncLocalStorage context
                        // Note: In NestJS, we need to ensure this is called within the request context
                        // that GlobalContextService tracks.
                        // Using `any` cast to access the private/protected property if needed, 
                        // but here we use the public getter we defined.
                        // We need to capture context OUTSIDE the callback if 'this' binding changes,
                        // but arrow functions preserve 'this'.
                        const branchId = this.context.branchId;

                        // Only set RLS if we have a branchId (operational context)
                        if (branchId) {
                            // In a real RLS setup with Row Level Security policies in Postgres,
                            // we would execute a raw query here to set the local variable.
                            // e.g., await tx.$executeRaw`SELECT set_config('app.current_branch_id', ${branchId}, true)`;
                            // For this application, we are enforcing tenant isolation via Prisma Middleware/Where clauses
                            // so we don't strictly *need* Postgres RLS yet, but the hook is here for future scaling.
                        }
                        return query(args);
                    },
                },
            },
        });
    }
}
