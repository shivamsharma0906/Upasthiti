# Upasthiti - Technical Documentation

## 1. Project Overview
**Purpose of the project:** Upasthiti is an education and attendance management system designed for students, teachers, and administrators. 
**Problem it solves:** It digitizes and streamlines attendance tracking (via QR codes and geolocation) and provides role-based dashboards for managing educational tasks like schedules, assignments, and student performance.
**Main features:**
- Role-based access control (Student, Teacher, Admin).
- QR code-based attendance scanning with optional geolocation constraints.
- Session and schedule management.
- Secure JWT-based authentication.
- Responsive, modern frontend using Shadcn UI and Tailwind CSS.
**Current development status:** The project has a functioning backend with basic file-based storage and a React-based frontend that is currently undergoing UI/UX redesign for a more distinctive, portfolio-grade presentation.

## 2. Tech Stack
- **Frontend technologies:** React 18, TypeScript, Vite, Tailwind CSS, Shadcn UI, Radix UI primitives, Lucide React icons, React Router DOM, React Query (TanStack Query), Zod for validation.
- **Backend technologies:** Node.js, Express.js, TypeScript.
- **Database:** Local JSON file-based storage (`/server/data/*.json`) used as a lightweight database for development/demonstration.
- **Authentication:** Custom JWT (JSON Web Tokens) implementation using `jsonwebtoken` and `bcryptjs`.
- **APIs used:** Internal REST API built with Express.
- **Deployment:** Standard Node.js deployment for the backend; Vite build for the frontend static assets.

## 3. Folder Structure
```text
Upasthiti/
├── public/                 # Static assets
├── server/                 # Backend Node.js/Express application
│   ├── data/               # JSON files acting as the database (users.json, sessions.json, attendance.json)
│   ├── src/                # Backend source code
│   │   ├── auth.ts         # JWT generation, verification, password hashing, and auth middleware
│   │   ├── index.ts        # Express app initialization, CORS, demo data seeding
│   │   ├── routes.ts       # API endpoints definition
│   │   ├── storage.ts      # File system database read/write utilities
│   │   └── types.ts        # TypeScript interfaces and types for the backend
│   ├── .env                # Backend environment variables
│   └── package.json        # Backend dependencies
├── src/                    # Frontend React application
│   ├── components/         # Reusable UI components
│   │   ├── layout/         # Layout components (Header, Sidebar, AppLayout)
│   │   ├── ui/             # Shadcn UI components
│   │   └── upasthiti/      # Domain-specific components (Schedule, etc.)
│   ├── contexts/           # React Contexts (AuthContext for global auth state)
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities (Tailwind merge, formatting, API client)
│   ├── pages/              # Route components
│   │   ├── admin/          # Admin dashboard pages
│   │   ├── student/        # Student dashboard pages
│   │   ├── teacher/        # Teacher dashboard pages
│   │   ├── Login.tsx       # Login page
│   │   ├── qr-scanner.tsx  # QR Scanner component
│   │   └── ...
│   ├── App.tsx             # Main routing configuration
│   ├── index.css           # Global Tailwind styles
│   └── main.tsx            # React application entry point
├── tailwind.config.ts      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite build configuration
└── package.json            # Frontend dependencies & root scripts
```
**Purpose of major folders and files:**
- `/server`: Contains the entirely independent Express backend. It handles all business logic, authentication, and persistence.
- `/src`: Contains the React frontend. It strictly handles presentation, routing, and consuming the backend API.
- `/src/pages`: Defines the main views for the application, categorized by user role (admin, student, teacher).
- `package.json` (Root): Uses `concurrently` to run both frontend and backend development servers simultaneously.

## 4. Architecture
**Communication between frontend, backend, and database:**
- The frontend (React) communicates with the backend (Express) via REST API over HTTP using `fetch` or a configured API client.
- Requests to protected endpoints include a JWT in the `Authorization: Bearer <token>` header.
- The backend parses the requests, validates the JWT, and enforces Role-Based Access Control (RBAC).
- The backend controllers (in `routes.ts`) read from and write to the local file system (`storage.ts`), which acts as the database layer.

**Request flow from client to database (Example: Login):**
1. **Client:** User submits email and password in `Login.tsx`. The `AuthContext` makes a `POST` request to `/api/auth/login`.
2. **Backend Route (`routes.ts`):** The `/auth/login` endpoint receives the request.
3. **Database Read (`storage.ts`):** `readUsers()` parses `users.json` and returns the array of users.
4. **Validation (`auth.ts`):** The backend checks if the user exists and uses `comparePassword` (bcrypt) to verify credentials.
5. **Token Generation (`auth.ts`):** A JWT is signed via `signJwt()`.
6. **Response:** The token and sanitized user object are returned to the client.

## 5. Backend
**Routes & Controllers (`server/src/routes.ts`):**
- `GET /health`: Health check endpoint.
- `POST /auth/signup`: Registers a new user, hashes password, saves to DB, returns JWT.
- `POST /auth/login`: Authenticates user, verifies password against hash, returns JWT.
- `GET /auth/me`: Returns the currently authenticated user's details. (Uses `requireAuth` middleware).
- `POST /sessions`: Creates a new class session (Teacher/Admin only).
- `GET /sessions`: Lists all sessions.
- `POST /sessions/:id/qr`: Generates a short-lived JWT representing a QR code for a session, optionally including location constraints (lat, lng, radius).
- `POST /attendance/scan`: Validates the scanned QR token, enforces geolocation (Haversine formula), and logs the attendance.
- `GET /attendance`: Lists all attendance records.

**Middleware:**
- `requireAuth(allowedRoles?)`: Located in `auth.ts`. Validates the Bearer JWT, extracts the user ID, fetches the user from the database, checks if their role is permitted, and attaches the user object to `req.user`.

**Models/Schemas (`server/src/types.ts`):**
- `UserRecord`: `{ id, name, email, passwordHash, role, avatar }`
- `SessionRecord`: `{ id, teacherId, department, subject, startTime, endTime, startDate, endDate, createdAt }`
- `AttendanceLogRecord`: `{ id, sessionId, studentId, method, timestamp }`
- `QrTokenPayload`: Defines the structure of the JWT embedded in the QR code (sessionId, exp, lat, lng, radius).

**Services and Utilities:**
- `server/src/auth.ts`: Handles `signJwt`, `verifyJwt`, `hashPassword`, and `comparePassword`.
- `server/src/storage.ts`: Handles file I/O `readUsers`, `writeUsers`, `readSessions`, `writeSessions`, `readAttendance`, `writeAttendance`.
- `haversineMeters` (in `routes.ts`): Calculates the distance between two geolocation coordinates to ensure students are in class when scanning QR codes.

**Environment Variables:**
- `PORT`: The port the Express server listens on (default: 5000).
- `JWT_SECRET`: The secret key used to sign and verify JSON Web Tokens.

## 6. Database
*Note: The project uses JSON files instead of a traditional database like MongoDB or PostgreSQL.*
**Collections (Files in `server/data/`):**
- **`users.json`**: Stores user accounts, their hashed passwords, roles (student/teacher/admin), and profile data.
- **`sessions.json`**: Stores created class sessions, associating them with a teacher and a time/date range.
- **`attendance.json`**: Stores the actual attendance logs, linking a student ID to a session ID and recording the timestamp and method (e.g., "qr").
