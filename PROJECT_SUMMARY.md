# AI ERP - Project Summary & Documentation

## Project Vision & Mission
**Vision:** To create a unified, intelligent Enterprise Resource Planning (ERP) system for educational institutions that simplifies management, enhances data visibility, and ensures operational efficiency.
**Mission:** Provide a robust, multi-tenant platform that caters to all stakeholders (Admins, Staff, Students) with role-specific tools, real-time analytics, and seamless data flow.
**Goal:** A fully functional, scalable web application connecting a modern frontend with a secure, structured backend.

---

## 1. Project Structure & Tech Stack

The project is a **Monorepo** managed with TurboRepo.

### Frontend (`apps/web`)
*   **Framework:** Next.js 15 (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS, Lucide Icons
*   **State/Charts:** Recharts for analytics
*   **Key Features:**
    *   **Context-Aware Portal:** Dynamic Dashboard and Sidebar based on User Role.
    *   **Feature Gates:** "Coming Soon" UI for modules under development (Library, Transport).
    *   **Strict RBAC:** Middleware enforcement preventing unauthorized route access.
    *   **Dynamic Headers:** Displays Portal Name and Branch Name (e.g., "Springfield High").

### Backend (`apps/api`)
*   **Framework:** NestJS
*   **Language:** TypeScript
*   **Database ORM:** Prisma
*   **Architecture:** Modular (Modules for Reporting, Transport, Library, etc.)
*   **Key Features:**
    *   **Role-Based Access Control (RBAC):** `RolesGuard` protects endpoints.
    *   **Global Context Service:** `ContextMiddleware` captures `x-user-role`, `x-branch-id` from headers for request-scoped access.
    *   **Mock Services:** Initial development uses mock data integration.

### Database (`packages/database`)
*   **Engine:** PostgreSQL
*   **Schema:** Prisma Schema defining complex relationships (Tenants, Branches, Users, Transport, Library, etc.).

---

## 2. User Roles & UI/UX Explanation

The application adapts its interface based on the logged-in user's role.

### **Types of Users**
1.  **Group/Branch Admin**:
    *   **Dashboard:** High-level KPIs (Total Students, Revenue, Attendance Trends).
    *   **Capabilities:** Full oversight of branch performance, financial data, and staff management.
    *   **UX:** Data-heavy, chart-centric interface for decision making.
2.  **Staff**:
    *   **Dashboard:** Operational focus.
    *   **Widgets:** "Today's Schedule" list, "Quick Actions" (Mark Attendance, Upload Marks).
    *   **UX:** Action-oriented, quick access to daily tasks.
3.  **Student**:
    *   **Dashboard:** Personal focus.
    *   **Widgets:** "Attendance Gauge" (Visual Progress), "Fee Status" (Paid/Overdue Card), "Upcoming Exams".
    *   **UX:** Simple, informative, and personal.

### **Security & Access**
*   **Frontend:** `middleware.ts` enforces strict route permissions based on `user-role` cookie. Unauthorized access attempts redirect to Dashboard.
*   **Backend:** `ContextMiddleware` ensures user identity is propagated to `RolesGuard`, securing API endpoints.

---

## 3. Data Flow & Integrity

### **Data Flow**
1.  **Client Request:** The Next.js frontend initiates a request (e.g., `fetchStats`).
    *   Headers: Includes `x-user-role` and `x-branch-id` to establish context.
2.  **API Gateway:** NestJS receives the request.
    *   **Middleware:** `ContextMiddleware` extracts headers into `GlobalContextService`.
    *   **Guards:** `RolesGuard` validates the role matches the endpoint requirements.
3.  **Service Layer:**
    *   Accesses the database (or Mock Data currently).
    *   Returns JSON response to the client.
4.  **UI Rendering:** React components (e.g., `KPICard`, `AreaChart`) render the data.

### **Data Integrity & Consistency**
*   **Schema Enforcement:** The Prisma schema (`schema.prisma`) enforces strict relationships:
    *   **Foreign Keys:** ensuring e.g., a `StudentProfile` must belong to a valid `User` and `Branch`.
    *   **Enums:** Constraining values for `UserRole`, `StudentStatus`, `PaymentStatus`.
    *   **Multi-tenancy:** All major entities invoke `Tenant` and `Branch` keys to prevent data leaks.
*   **Audit Logging:** An `AuditLog` model exists to track `CREATE`, `UPDATE`, `DELETE` actions.

---

## 4. Current Development Status (Dev Logs)

### **Frontend Dev Log**
*   **Status:** Context-Aware Dashboard fully functional.
*   **Navigation:** Role-Based Sidebar implemented via `navigation.config.ts`.
*   **Security:** Middleware-based RBAC enforcement active.
*   **Components:** Feature Gates implemented for Library and Transport.
*   **UI/UX:** High-fidelity dashboards implemented for Student and Staff personas.
*   **Bug Fixes:** Resolved import path errors.

### **Backend Dev Log**
*   **Status:** API serving Role-based data.
*   **Middleware:** `ContextMiddleware` registered and functional.
*   **Guards:** `RolesGuard` actively protecting endpoints against unauthorized access.
*   **Database:** Prisma client generated (Mock Mode active for MVP dashboard).

---

## 5. Instructions to Run

The necessary tools have been installed.
1.  **API:** Running on `http://localhost:3001` (Mock Mode).
2.  **Web:** Running on `http://localhost:3000`.

To access the dashboard, navigate to `http://localhost:3000`.
*Note: You may need to set a cookie `user-role=GROUP_ADMIN` or `STUDENT` to see different views, or use the login flow if implemented.*
