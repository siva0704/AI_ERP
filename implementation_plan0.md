
# Implementation Plan - Phase 12: Atomic Admission

## User Review Required
> [!IMPORTANT]
> **Transactional Integrity**: The Admission process now creates a User, Student Profile, and Fee Ledger in a single atomic transaction. If any step fails, the entire admission is rolled back.

## Proposed Changes

### Backend (`apps/api`)

#### [MODIFY] [admission.service.ts](file:///Users/vaibhav/AI_ERP/apps/api/src/modules/admission/admission.service.ts)
- Implement `admitStudent` using `prisma.$transaction`.
- Logic:
    1. Check for duplicate Email.
    2. Create `User` (Role: STUDENT).
    3. Create `StudentProfile`.
    4. Create `FeeLedger` (Admission Fee).

#### [MODIFY] [admission.controller.ts](file:///Users/vaibhav/AI_ERP/apps/api/src/modules/admission/admission.controller.ts)
- Update `create` endpoint to accept `CreateAdmissionDto`.

#### [NEW] [create-admission.dto.ts](file:///Users/vaibhav/AI_ERP/apps/api/src/modules/admission/dto/create-admission.dto.ts)
- Define strict validation rules (Email format, Required fields).

### Frontend (`apps/web`)

#### [NEW] [admission-wizard](file:///Users/vaibhav/AI_ERP/apps/web/components/admissions/admission-wizard.tsx)
- Multi-step form using `react-hook-form` and `zod`.
- Steps: Personal Info, Academic Info, Fee Confirmation (Preview).

#### [NEW] [use-admissions.ts](file:///Users/vaibhav/AI_ERP/apps/web/hooks/use-admissions.ts)
- React Query mutation for `createAdmission`.
- React Query query for `getStudents`.

## Verification Plan

### Automated Tests
- N/A for this phase (Manual Verification prioritized).

### Manual Verification
1.  **Golden Thread**: Submit the Wizard form. Check DB for `User`, `Student`, and `Fee` records.
2.  **Duplicate Check**: Try to admit the same email twice. Expect 409 Conflict.
3.  **UI State**: Refresh page on Step 2. Verify form data persists (LocalStorage).
