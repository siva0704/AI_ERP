---
description: Reset and Start Local Environment
---

1.  **Database**:
    *   // turbo
    *   Run `docker compose down -v` (Clean slate).
    *   // turbo
    *   Run `docker compose up -d`.

2.  **Schema Push**:
    *   Navigate to `packages/database`.
    *   // turbo
    *   Run `npx prisma db push`.

3.  **Security**:
    *   **CRITICAL**: Execute the RLS Policy Script.
    *   Run `docker exec -i <container_name> psql -U user -d mydb < ../../rls_policies.sql` (Adjust path as needed).

4.  **Seed**:
    *   Run the seed script (if available).
