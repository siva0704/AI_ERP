import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from '../../modules/audit/audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
    private readonly logger = new Logger(AuditInterceptor.name);

    constructor(private readonly auditService: AuditService) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const req = context.switchToHttp().getRequest();
        const method = req.method;
        const start = Date.now();

        // Only audit state-changing methods
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && !req.url.includes('upload')) {
            console.log(`[AuditInterceptor] Intercepting ${method} ${req.url}`);
            return next.handle().pipe(
                tap({
                    next: async (data) => {
                        console.log('[AuditInterceptor] Request successful, logging...');
                        const duration = Date.now() - start;
                        try {
                            const user = req.user;
                            const tenantId = req.headers['x-tenant-id'] || 'default-tenant';

                            console.log(`[AuditInterceptor] Calling Service with Tenant: ${tenantId}`);
                            // Construct Audit Log
                            // Todo: Extract entity/entityId from URL if possible (e.g. /students/:id)
                            await this.auditService.log({
                                action: method,
                                resource: req.url,
                                userId: user?.sub || user?.id,
                                reqPayload: req.body,
                                // Future: capture oldData/newData via specific service logic or DB hooks
                                tenantId,
                                duration
                            });
                            console.log('[AuditInterceptor] Logged.');

                        } catch (err) {
                            console.error('[AuditInterceptor] Error:', err);
                            this.logger.error('Failed to write audit log', err);
                        }
                    },
                    error: (err) => {
                        console.error('[AuditInterceptor] Request Failed', err);
                        // We could audit failures too (4xx/5xx)
                    }
                })
            );
        }

        return next.handle();
    }
}
