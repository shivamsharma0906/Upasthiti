# Upasthiti 2.0

### Smart College Attendance & Academic Management Platform

Upasthiti 2.0 is a modern college management platform designed to bring **students, faculty, and administrators** together in one centralized academic system.

The platform combines attendance management with academic tools such as **QR attendance, timetables, subjects, performance, assignments, course materials, announcements, leave requests, and attendance correction workflows**.

---

## 🚀 Getting Started

### Prerequisites

Make sure you have:

- Node.js
- npm

### Clone the Repository

```bash
git clone <YOUR_GIT_REPOSITORY_URL>
cd Upasthiti
```

### Install Dependencies

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

The application will be available at the local development URL shown in the terminal.

---

## 🛠️ Technology Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- React Router
- TanStack Query
- Recharts
- Framer Motion
- Lucide Icons

### Backend

- Node.js
- Express
- TypeScript
- JWT Authentication
- bcryptjs

---

## 👨‍🎓 Student Features

- Student registration
- First-login academic profile completion
- Student profile
- Attendance dashboard
- QR attendance scanning
- Geolocation-based attendance
- Weekly timetable
- Subject management
- Academic performance
- Assignments
- Course materials
- Announcements
- Notifications
- Leave requests
- Attendance correction
- Account settings

---

## 👨‍🏫 Faculty Features

- Attendance session creation
- QR generation
- Student attendance management
- Class management
- Subject management
- Assignment management
- Course material management
- Announcements
- Leave request review
- Attendance correction review
- Attendance analytics

---

## 🛡️ Administration

Administrators can manage institutional academic structures including:

- Students
- Faculty
- Departments
- Programs
- Years
- Semesters
- Sections
- Academic sessions
- Subjects
- Timetables
- Attendance
- Announcements

---

## 📅 Timetable System

Upasthiti supports different routines for different academic groups.

Each timetable can be associated with:

```text
Program
Department
Year
Semester
Section
Academic Session
```

This allows different sections and branches to have completely different routines.

Example:

```text
B.Tech AI & ML
├── Semester 5
│   ├── Section A
│   └── Section B
│
B.Tech CSE
├── Semester 5
│   ├── Section A
│   └── Section B
```

Authorized administrators can create and manage weekly timetables.

Students automatically see the timetable associated with their academic profile.

---

## 📱 Attendance

Attendance is the core system of Upasthiti.

The platform supports:

- QR-based attendance
- Expiring QR sessions
- Student authentication
- Attendance verification
- Geolocation verification
- Attendance history
- Subject-wise attendance
- Attendance analytics
- Attendance correction requests

Students can view their attendance and track their attendance status across subjects.

---

## 🔐 Authentication

Upasthiti uses role-based authentication for:

```text
Student
Faculty
Admin
```

Student registration collects basic account information, while first login requires completion of the student's academic profile.

Required academic information includes:

- University Roll Number
- Department
- Program / Course
- Year
- Semester
- Section
- Academic Session

---

## 🎨 Design

The application uses a modern academic dashboard design focused on:

- Responsive layouts
- Clear information hierarchy
- Accessible interfaces
- Consistent components
- Loading states
- Empty states
- Error handling
- Role-specific experiences

---

## 📂 Project Structure

```text
Upasthiti/
│
├── src/
│   ├── components/
│   ├── pages/
│   │   ├── student/
│   │   ├── teacher/
│   │   └── admin/
│   ├── contexts/
│   ├── hooks/
│   ├── lib/
│   └── services/
│
├── server/
│   ├── src/
│   └── data/
│
├── public/
├── scripts/
├── package.json
└── README.md
```

---

## 🧪 Development

Build the project:

```bash
npm run build
```

Run type checking if available:

```bash
npm run typecheck
```

---

## 🗺️ Roadmap

### Student

- [x] Registration
- [x] First-login profile completion
- [x] Student profile
- [x] Dashboard
- [x] Attendance
- [x] QR attendance
- [x] Timetable
- [x] Subjects
- [ ] Performance
- [ ] Assignments
- [ ] Course materials
- [ ] Announcements
- [ ] Notifications
- [ ] Leave management
- [ ] Attendance correction
- [ ] Settings

### Faculty

- [ ] Faculty dashboard
- [ ] Class management
- [ ] Student management
- [ ] Subject management
- [ ] Assignment management
- [ ] Course material management
- [ ] Announcement management
- [ ] Leave approval
- [ ] Attendance correction
- [ ] Attendance analytics

### Administration

- [ ] Student management
- [ ] Faculty management
- [ ] Academic structure management
- [x] Timetable builder
- [ ] Institutional analytics
- [ ] System configuration

### Platform

- [ ] Production database
- [ ] Advanced authorization
- [ ] Audit logs
- [ ] Rate limiting
- [ ] Offline attendance
- [ ] Advanced biometric attendance
- [ ] Production deployment

---

## 🎯 Vision

Upasthiti aims to become a complete **digital academic workspace for colleges**, connecting:

```text
Students
    ↓
Attendance • Timetable • Subjects
Performance • Assignments • Resources
    ↓
Faculty
    ↓
Academic Management
    ↓
Administration
```

The goal is to replace disconnected academic workflows with one reliable, structured, and student-focused platform.

---

## 👨‍💻 Upasthiti 2.0

**Smart College Attendance & Academic Management Platform**

Built with **React, TypeScript, Vite, Express, Tailwind CSS, and modern web technologies.**
