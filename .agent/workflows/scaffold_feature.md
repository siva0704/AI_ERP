---
description: Create a new Feature Module (Backend & Database)
---

1.  **Database Layer**:
    *   Edit `packages/database/prisma/schema.prisma`.
    *   Add new models with `branchId String`.
    *   Add `@@map("table_name")`.
    *   Run `npx prisma generate` in `packages/database`.
    *   // turbo
    *   Run `npx prisma generate` in `apps/api` (if needed for separate client).

2.  **Backend Layer**:
    *   Create Module: `nest g module modules/<feature_name>` in `apps/api`.
    *   Create Controller: `nest g controller modules/<feature_name>`.
    *   Create Service: `nest g service modules/<feature_name>`.
    *   **Implementation**:
        *   Inject `PrismaService` and `GlobalContextService`.
        *   Ensure all queries usage `branchId` from context or transaction.

3.  **Registration**:
    *   Ensure the new module is imported in `app.module.ts`.
