/*
  Warnings:

  - You are about to alter the column `endTime` on the `timetables` table. The data in that column could be lost. The data in that column will be cast from `DateTime` to `Int`.
  - You are about to alter the column `startTime` on the `timetables` table. The data in that column could be lost. The data in that column will be cast from `DateTime` to `Int`.

*/
-- AlterTable
ALTER TABLE "fee_structures" ADD COLUMN "installments" TEXT;

-- AlterTable
ALTER TABLE "staff_profiles" ADD COLUMN "bankAccountNo" TEXT;
ALTER TABLE "staff_profiles" ADD COLUMN "bankIfsc" TEXT;
ALTER TABLE "staff_profiles" ADD COLUMN "emergencyContactName" TEXT;
ALTER TABLE "staff_profiles" ADD COLUMN "emergencyContactPhone" TEXT;
ALTER TABLE "staff_profiles" ADD COLUMN "experienceYears" INTEGER DEFAULT 0;
ALTER TABLE "staff_profiles" ADD COLUMN "qualification" TEXT;

-- AlterTable
ALTER TABLE "student_profiles" ADD COLUMN "addressLine1" TEXT;
ALTER TABLE "student_profiles" ADD COLUMN "bloodGroup" TEXT;
ALTER TABLE "student_profiles" ADD COLUMN "city" TEXT;
ALTER TABLE "student_profiles" ADD COLUMN "dob" DATETIME;
ALTER TABLE "student_profiles" ADD COLUMN "gender" TEXT;
ALTER TABLE "student_profiles" ADD COLUMN "gradeLevel" TEXT;
ALTER TABLE "student_profiles" ADD COLUMN "previousSchool" TEXT;
ALTER TABLE "student_profiles" ADD COLUMN "state" TEXT;
ALTER TABLE "student_profiles" ADD COLUMN "zipCode" TEXT;

-- CreateTable
CREATE TABLE "payroll_runs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "branchId" TEXT NOT NULL,
    "month" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "totalPayout" DECIMAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "payroll_runs_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "ownerId" TEXT NOT NULL,
    "branchId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "documents_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "documents_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_payroll_ledgers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "staffId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "month" DATETIME NOT NULL,
    "baseSalary" DECIMAL NOT NULL,
    "totalDeductions" DECIMAL NOT NULL,
    "netSalary" DECIMAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" DATETIME,
    "overrideAmount" DECIMAL,
    "overrideReason" TEXT,
    "payrollRunId" TEXT,
    CONSTRAINT "payroll_ledgers_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "staff_profiles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "payroll_ledgers_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "payroll_ledgers_payrollRunId_fkey" FOREIGN KEY ("payrollRunId") REFERENCES "payroll_runs" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_payroll_ledgers" ("baseSalary", "branchId", "generatedAt", "id", "month", "netSalary", "overrideAmount", "overrideReason", "paidAt", "staffId", "status", "totalDeductions") SELECT "baseSalary", "branchId", "generatedAt", "id", "month", "netSalary", "overrideAmount", "overrideReason", "paidAt", "staffId", "status", "totalDeductions" FROM "payroll_ledgers";
DROP TABLE "payroll_ledgers";
ALTER TABLE "new_payroll_ledgers" RENAME TO "payroll_ledgers";
CREATE TABLE "new_timetables" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dayOfWeek" TEXT NOT NULL,
    "startTime" INTEGER NOT NULL,
    "endTime" INTEGER NOT NULL,
    "subjectId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "classroomId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "timetables_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "timetables_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "timetables_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "classrooms" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "timetables_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_timetables" ("branchId", "classroomId", "createdAt", "dayOfWeek", "deletedAt", "endTime", "id", "startTime", "subjectId", "teacherId", "updatedAt") SELECT "branchId", "classroomId", "createdAt", "dayOfWeek", "deletedAt", "endTime", "id", "startTime", "subjectId", "teacherId", "updatedAt" FROM "timetables";
DROP TABLE "timetables";
ALTER TABLE "new_timetables" RENAME TO "timetables";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
