INSERT INTO "tenants" ("id", "name", "createdAt", "updatedAt") VALUES ('default-tenant-id', 'Default Tenant', NOW(), NOW()) ON CONFLICT DO NOTHING;
INSERT INTO "branches" ("id", "name", "tenantId", "createdAt", "updatedAt") VALUES ('default-branch', 'Main Branch', 'default-tenant-id', NOW(), NOW()) ON CONFLICT DO NOTHING;
INSERT INTO "users" ("id", "email", "role", "branchId", "createdAt", "updatedAt") VALUES ('demo-user-id', 'demo@example.com', 'BRANCH_ADMIN', 'default-branch', NOW(), NOW()) ON CONFLICT DO NOTHING;
