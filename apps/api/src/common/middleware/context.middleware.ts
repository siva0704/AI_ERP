import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { GlobalContextService } from '../context/global-context.service';

@Injectable()
export class ContextMiddleware implements NestMiddleware {
    constructor(private readonly globalContext: GlobalContextService) { }

    use(req: Request, res: Response, next: NextFunction) {
        // MOCK AUTH: Injecting Hardcoded User
        const mockContext = {
            userId: 'demo-user-id',
            role: 'BRANCH_ADMIN', // Giving high privileges
            branchId: 'default-branch',
        };

        // Initialize AsynLocalStorage context for this request
        this.globalContext.runWith(mockContext, () => {
            next();
        });
    }
}
