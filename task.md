
# Task: Phase 12 - Genesis Module (Admissions)

- [x] **Backend: Atomic Admission Transaction** <!-- id: 0 -->
    - [x] Explore existing `AdmissionModule` and `PrismaSchema`. <!-- id: 1 -->
    - [x] Implement `Dto` for Admission (Student + User + Guardian + Fees). <!-- id: 2 -->
    - [x] Refactor `AdmissionService.createAdmission` to use `prisma.$transaction`. <!-- id: 3 -->
    - [x] Link `User` -> `StudentProfile` -> `FeeLedger`. <!-- id: 4 -->
- [x] **Frontend: Admission Wizard** <!-- id: 5 -->
    - [x] Create Zod Schemas for each step (Personal, Guardian, Academic). <!-- id: 6 -->
    - [x] Implement `AdmissionWizard` UI with `react-hook-form`. <!-- id: 7 -->
    - [x] Add `localStorage` persistence for draft saving. <!-- id: 8 -->
- [x] **Integration & verification** <!-- id: 9 -->
    - [x] Create `hooks/useAdmissions.ts`. <!-- id: 10 -->
    - [x] Verify "Golden Thread" (Ledger creation). <!-- id: 11 -->
    - [x] Verify Duplicate handling. <!-- id: 12 -->

# Task: Project Launch <!-- id: 13 -->

- [ ] **Environment Setup** <!-- id: 14 -->
    - [ ] Verify Docker Daemon is running. <!-- id: 15 -->
    - [ ] Start Database Containers (`postgres`, `redis`). <!-- id: 16 -->
    - [ ] Verify Database Connectivity. <!-- id: 17 -->
- [ ] **Application Startup** <!-- id: 18 -->
    - [ ] Start Development Server (`npm run dev`). <!-- id: 19 -->
    - [ ] Verify Web App loads (`localhost:3000`). <!-- id: 20 -->
    - [ ] Verify API connectivity. <!-- id: 21 -->
