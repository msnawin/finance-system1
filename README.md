# Finance Dashboard System

A full-stack Finance Dashboard application demonstrating a clean architecture, role-based access control, and a modern frontend interface.

## Tech Stack
- **Backend**: Java 17, Spring Boot 3, Spring Web, Spring Data JPA, MySQL 8
- **Frontend**: React.js, Vite, Tailwind CSS, Axios, Recharts, Lucide React

## Project Overview

This system provides a unified dashboard to track financial income and expenses. It enforces role-based access to securely restrict sensitive data and operations based on user privileges.

### Role-Based Access Control

- **VIEWER**: Can read the Dashboard summary analytics. Cannot access the Transactions list or modify data.
- **ANALYST**: Can view the Dashboard and view the Transactions list. Cannot create, delete, or manage users.
- **ADMIN**: Has full access. Can view the Dashboard, view/create/delete Transactions, and manage User activation status.

*Note on Authentication*: The application uses a mock authentication approach to simplify testing. You select a user at the Login screen, which passes their ID as an `X-User-Id` HTTP header to the backend.

---

## Database Setup

1. Ensure MySQL server is running locally on port `3306`.
2. Create a database named `finance_db` if it does not auto-create.
3. Access credentials configured in `application.properties`:
   - Username: `root`
   - Password: `nawinthegoogler07`
4. The database tables (`users`, `transactions`) are auto-generated via Hibernate `update`.
5. Upon the first startup, a `DataSeeder` automatically populates the database with default Admin/Analyst/Viewer users and a few sample transactions.

---

## How to Run the Backend

1. Navigate to the `backend` directory.
2. Run the Spring Boot application. If you have Maven installed, use:
   ```bash
   mvnw spring-boot:run
   ```
   Or run the main class `FinanceDashboardApplication` via your IDE.
3. The server runs on `http://localhost:8080`.
4. API Documentation (Swagger) is available at `http://localhost:8080/swagger-ui.html`.

## How to Run the Frontend

1. Navigate to the `frontend` directory.
2. Ensure you have Node.js installed.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open `http://localhost:5173` in your browser.
