import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { GlobalContextService } from '../context/global-context.service';

@Injectable()
export class ContextMiddleware implements NestMiddleware {
    constructor(private readonly globalContext: GlobalContextService) { }

    use(req: Request, res: Response, next: NextFunction) {
        // AUTH: Read Identity from Headers (Gateway/Frontend should pass these)
        // In Prod: Do NOT trust headers directly unless from a trusted Gateway or validated JWT
        const userId = (req.headers['x-user-id'] as string) || 'demo-user-id';
        const role = (req.headers['x-user-role'] as string) || 'BRANCH_ADMIN'; // Default to Admin for Mock Testing
        const branchId = (req.headers['x-branch-id'] as string) || 'default-branch';

        const context = {
            userId,
            role,
            branchId,
        };

        // Initialize AsyncLocalStorage context for this request
        this.globalContext.runWith(context, () => {
            next();
        });
    }
}
