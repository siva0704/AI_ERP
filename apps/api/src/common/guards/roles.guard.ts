import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GlobalContextService } from '../context/global-context.service';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private context: GlobalContextService,
    ) { }

    canActivate(context: ExecutionContext): boolean {
        const roles = this.reflector.get<string[]>('roles', context.getHandler());
        if (!roles) {
            return true;
        }

        // In a real app, role comes from the Context (populated by Auth Middleware)
        // For MVP, we simulate a role or check context
        const userRole = this.context.role || 'GUEST'; // Default to GUEST if no role

        return roles.includes(userRole);
    }
}
