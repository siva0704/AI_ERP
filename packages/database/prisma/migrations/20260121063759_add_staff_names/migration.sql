-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_staff_profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL DEFAULT 'Staff',
    "lastName" TEXT NOT NULL DEFAULT 'Member',
    "branchId" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "baseSalary" DECIMAL NOT NULL,
    "joinDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "qualification" TEXT,
    "experienceYears" INTEGER DEFAULT 0,
    "bankAccountNo" TEXT,
    "bankIfsc" TEXT,
    "emergencyContactName" TEXT,
    "emergencyContactPhone" TEXT,
    CONSTRAINT "staff_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "staff_profiles_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_staff_profiles" ("bankAccountNo", "bankIfsc", "baseSalary", "branchId", "department", "designation", "emergencyContactName", "emergencyContactPhone", "experienceYears", "id", "joinDate", "qualification", "userId") SELECT "bankAccountNo", "bankIfsc", "baseSalary", "branchId", "department", "designation", "emergencyContactName", "emergencyContactPhone", "experienceYears", "id", "joinDate", "qualification", "userId" FROM "staff_profiles";
DROP TABLE "staff_profiles";
ALTER TABLE "new_staff_profiles" RENAME TO "staff_profiles";
CREATE UNIQUE INDEX "staff_profiles_userId_key" ON "staff_profiles"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
