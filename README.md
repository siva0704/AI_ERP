# AI ERP

This is a monorepo workspace containing the AI ERP application, managed with [TurboRepo](https://turbo.build/).

## Project Structure

-   `apps/web`: Next.js frontend application.
-   `apps/api`: NestJS backend API.
-   `packages/*`: Shared packages (if any).

## Prerequisites

-   Node.js (>= 18)
-   npm (>= 10)
-   PostgreSQL (running locally or remote)

## Getting Started

1.  **Install Dependencies**

    ```bash
    npm install
    ```

2.  **Environment Setup**

    Ensure you have the necessary environment variables set up.
    -   `apps/web/.env.local`: Contains frontend public keys (Clerk, etc.) and backend URL.
    -   `apps/api/.env`: Contains database URL and other secrets.

    *Note: If you have a `setup_env.ps1` script, you might want to run it to generate initial configs.*

3.  **Run Development Server**

    Start both the frontend and backend in development mode:

    ```bash
    npm run dev
    ```

    -   **Web**: [http://localhost:3000](http://localhost:3000) (or 3001 if port taken)
    -   **API**: [http://localhost:3001](http://localhost:3001) (check logs for exact port)

4.  **Building for Production**

    ```bash
    npm run build
    ```

## Commands

-   `npm run dev`: Start development servers.
-   `npm run build`: Build all apps.
-   `npm run lint`: Lint all apps.