# Project Rules

## Architecture Constraints
1.  **Monorepo Structure**:
    *   Frontend: `apps/web` (Next.js 15, App Router, Tailwind).
    *   Backend: `apps/api` (NestJS, Global Context).
    *   Database: `packages/database` (Prisma v7).
2.  **Multi-Tenancy**:
    *   **Strict RLS**: Every operational table MUST have a `branchId` column.
    *   **Context**: All Backend logic must use `GlobalContextService` to retrieve the current `tenant/branch` ID.
3.  **Financial Integrity**:
    *   **Golden Thread**: Any operation that admits a student or modifies their profile MUST also generate a corresponding `FeeLedger` entry in the **SAME Database Transaction**.

## Coding Standards
*   **Backend**: Use standard NestJS Modules. Dependency Inject `PrismaService` and `GlobalContextService`.
*   **Frontend**: Use `lucide-react` for icons. Layouts must be in `(dashboard)` group for admin features.
*   **Prisma**: Do NOT use `datasource.url` in schema (Prisma 7 change). Use `prisma.config.ts`.
