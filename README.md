# 🎓 StudyConnect: Enterprise Academic Ecosystem

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-11-FFCA28?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Capacitor](https://img.shields.io/badge/Capacitor-7-blue?style=for-the-badge&logo=capacitor)](https://capacitorjs.com/)

StudyConnect is a high-performance, hierarchical institutional management platform designed for modern academic environments. It provides a unified command center for Administrators, specialized sub-management for HODs, professional tools for Faculty, and a data-rich experience for Students.

---

## 🏛️ System Architecture & Hierarchy

The platform is built on a **Hierarchical Academic Model**, ensuring data integrity and logical navigation from the top-level institution down to individual student performance.

1.  **Departments (Divisions):** The primary organizational unit. Manages assigned Faculty, Students, Classes, and Curriculum.
2.  **Classes (Sections):** Academic cohorts within a department. Maps specific students to subject handlers (faculty).
3.  **Rosters & Ledgers:** The final node where individual attendance, marks, and biographical data (Bio-Data) are managed.

---

## 🔑 Access Roles

### 1. Master Administrator
*   **Permissions:** Full system oversight.
*   **Modules:** Global Identity Hub (Users), Institutional Architecture (Departments), Curricula Management, System Logs, and Global Configuration.
*   **Key Feature:** Can provision the entire academic hierarchy using the **Bulk Data System**.

### 2. HOD (Head of Department) - Sub-Admin
*   **Permissions:** Department-restricted management.
*   **Scope:** Only visible data and controls pertaining to their assigned `departmentId`.
*   **Workflow:** Manages faculty performance, class sections, and departmental results without accessing global system settings.

### 3. Faculty Portal
*   **Scope:** Management of assigned academic loads.
*   **Modules:** Attendance Registry, Grade Ledger, Course Assignments, Study Resource Repository, and Broadcast Announcements.
*   **Analytics:** Comparative class success charts and student risk alerts.

### 4. Student Portal
*   **Scope:** Personal academic journey.
*   **Modules:** Subject Overview, Presence Tracking, Internal Marks, End-Sem Results, Assignment Submissions, and Biographical Registry.
*   **Analytics:** SGPA progression and credit weightage distribution.

---

## 🚀 Key Features

### 🎨 Modular Visual Identity
Users can personalize their entire portal experience via the **Visual Builder**:
*   **Workspace Backgrounds:** Stellar Black, Midnight Navy, Paper White, or Cloud Gray.
*   **Primary Accents:** Ocean Blue, Forest Green, Deep Purple, Golden Sun, or Velvet Rose.
*   **Nav Hub Styles:** 
    *   *Orbital Wheel:* A circular carousel of icons.
    *   *Linear Dynamic:* A draggable, looping track that aligns to the screen edge.

### 📊 Beautiful Analytics
Integrated **Recharts** visualizations across all dashboards:
*   Enrollment distributions (Pie).
*   GPA and Attendance growth trends (Area).
*   Departmental Performance Leaderboards (Bar).

### 📂 Bulk Data Management
Standardized CSV system for high-volume operations:
*   **Downloadable Templates:** Every admin module provides a format guide.
*   **Smart Imports:** Bulk onboard thousands of users, students, or grades in seconds.

### 🔍 Institutional Command Center
The header search bar dynamically indexes every portal module. Simply type "Bio," "Grades," or "Dept" to instantly navigate to deep management paths.

---

## 🛠️ Technical Stack
*   **Frontend:** Next.js 15 (App Router), React 19, Tailwind CSS.
*   **UI Components:** Shadcn UI (Radix Primitives).
*   **Backend:** Firebase (Auth, Firestore).
*   **Mobile:** Capacitor 7 integration for native Android/iOS builds.
*   **Animations:** Framer Motion for high-fidelity transitions.

---

## 🔑 Demonstration Access
- **Portal:** [https://studyconnect-taupe.vercel.app/login](https://studyconnect-taupe.vercel.app/login)
- **Admin:** `Admin01` | `minister123`
- **Demo Mode:** Select Student/Faculty and enter `demo` | `demo123`
