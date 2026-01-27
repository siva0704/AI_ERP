/*
  Warnings:

  - You are about to drop the column `payload` on the `audit_logs` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "audit_logs" DROP COLUMN "payload",
ADD COLUMN     "branchId" TEXT,
ADD COLUMN     "duration" INTEGER,
ADD COLUMN     "entity" TEXT,
ADD COLUMN     "entityId" TEXT,
ADD COLUMN     "newData" TEXT,
ADD COLUMN     "oldData" TEXT,
ADD COLUMN     "reqPayload" TEXT;

-- CreateIndex
CREATE INDEX "audit_logs_tenantId_idx" ON "audit_logs"("tenantId");

-- CreateIndex
CREATE INDEX "audit_logs_entity_entityId_idx" ON "audit_logs"("entity", "entityId");
