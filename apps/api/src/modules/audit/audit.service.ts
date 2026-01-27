import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditService {
    private readonly logger = new Logger(AuditService.name);
    private readonly SENSITIVE_KEYS = [
        'password',
        'token',
        'secret',
        'aadhaarNo',
        'panNumber',
        'bankAccountNo',
        'creditCard',
        'authorization'
    ];

    constructor(private readonly prisma: PrismaService) { }

    async log(params: {
        action: string;
        resource: string;
        userId?: string;
        entity?: string;
        entityId?: string;
        reqPayload?: any;
        oldData?: any;
        newData?: any;
        tenantId: string;
        duration?: number;
    }) {
        try {
            // Safe-guard: Ensure tenantId exists (if not provided, try to find a fallback or just log warning)
            if (!params.tenantId) {
                this.logger.warn(`AuditLog skipped: Missing tenantId for user ${params.userId}`);
                return;
            }

            const payload = this.maskData(params.reqPayload);
            const oldData = this.maskData(params.oldData);
            const newData = this.maskData(params.newData);

            await this.prisma.auditLog.create({
                data: {
                    action: params.action,
                    resource: params.resource,
                    userId: params.userId,
                    entity: params.entity,
                    entityId: params.entityId,
                    reqPayload: payload ? JSON.stringify(payload) : undefined,
                    oldData: oldData ? JSON.stringify(oldData) : undefined,
                    newData: newData ? JSON.stringify(newData) : undefined,
                    duration: params.duration,
                    tenantId: params.tenantId
                }
            });

            this.logger.log(`AuditLog created: ${params.action} on ${params.resource} by ${params.userId}`);
        } catch (error) {
            this.logger.error('Failed to create AuditLog', error);
            // We do NOT throw here to avoid failing the main request
        }
    }

    private maskData(data: any): any {
        if (!data) return data;
        if (typeof data !== 'object') return data;

        // Deep copy to avoid mutating original object
        const copy = JSON.parse(JSON.stringify(data));

        const maskRecursive = (obj: any) => {
            for (const key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    // Check if key is sensitive
                    if (this.SENSITIVE_KEYS.some(k => key.toLowerCase().includes(k.toLowerCase()))) {
                        obj[key] = '********';
                    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                        maskRecursive(obj[key]);
                    }
                }
            }
        };

        maskRecursive(copy);
        return copy;
    }
}
