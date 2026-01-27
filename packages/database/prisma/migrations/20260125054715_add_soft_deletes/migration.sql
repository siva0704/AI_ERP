-- AlterTable
ALTER TABLE "documents" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "fee_ledgers" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "staff_profiles" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "student_profiles" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "fee_ledgers_status_idx" ON "fee_ledgers"("status");

-- CreateIndex
CREATE INDEX "fee_ledgers_studentId_idx" ON "fee_ledgers"("studentId");

-- CreateIndex
CREATE INDEX "staff_profiles_panNumber_idx" ON "staff_profiles"("panNumber");

-- CreateIndex
CREATE INDEX "student_profiles_enrollmentNo_idx" ON "student_profiles"("enrollmentNo");

-- CreateIndex
CREATE INDEX "student_profiles_aadhaarNo_idx" ON "student_profiles"("aadhaarNo");
