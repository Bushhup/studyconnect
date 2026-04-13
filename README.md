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

## 🗺️ System Sitemap

### 🌐 Public Access
*   **Home (`/`):** Hero, institutional stats, facilities, and testimonials.
*   **Achievements (`/achievements`):** Historical milestones and awards.
*   **Gallery (`/gallery`):** Visual tour of campus facilities and labs.
*   **Events (`/events`):** Upcoming workshops, cultural meets, and past events.
*   **Login (`/login`):** Unified role-based authentication portal.

### 👑 Admin & HOD Portal (`/admin`)
*   **Dashboard:** Institutional oversight with enrollment distributions and growth trends.
*   **Institutional Architecture:**
    *   `Division Hub`: Manage specific departments, faculty impact, and class sections.
    *   `Class Portal`: Deep-dive into student performance ledgers and subject handler ratings.
*   **Identity Hub (Users):** Centralized directory for access control.
    *   `Faculty Directory`: Staff profiles and departmental mapping.
    *   `Student Directory`: Enrollment status and performance overview.
    *   `Bio-Data Registry`: Access to verified student identity records.
*   **Academic Results:** Performance leaderboard ranked by department scores.
*   **Operations:**
    *   `Attendance Hub`: Real-time trends and bulk log processing.
    *   `Curriculum`: Course credit and degree requirements management.
    *   `Analytics`: Deep-dive placement and student retention reports.
    *   `System Logs`: Comprehensive audit trail of admin activity.

### 👨‍🏫 Faculty Portal (`/faculty`)
*   **Teaching Hub:**
    *   `My Classes`: Assigned sections, timings, and classroom allocations.
    *   `Students`: Directory of students enrolled in handler's subjects.
*   **Academics:**
    *   `Attendance`: Session-wise presence recording.
    *   `Grades`: CAT-1, CAT-2, and Model exam mark entry.
    *   `Assignments`: Task creation, deadline management, and grading.
    *   `Resources`: Study material repository for student downloads.
*   **Engagement:**
    *   `Announcements`: Broadcast alerts directly to student dashboards.
    *   `Calendar`: Personal teaching schedule and deadlines.

### 🎓 Student Portal (`/student`)
*   **My Identity:**
    *   `Profile`: Verified institutional record.
    *   `Bio Data`: Self-service biographical registry (Family, ID, Contact).
*   **Academic Journey:**
    *   `Curriculum`: Active courses, syllabus details, and faculty handlers.
    *   `Attendance`: Real-time monitoring with "At-Risk" alerts.
    *   `Marks`: Internal assessment scorecards.
    *   `Results`: Official end-semester grade cards.
*   **Materials & Tasks:**
    *   `Assignments`: Digital submission portal.
    *   `Resources`: Downloadable notes and reference materials.
    *   `Broadcasts`: Institutional announcement feed.

---

## 🔑 Access Roles

### 1. Master Administrator
*   **Permissions:** Full system oversight.
*   **Key Feature:** Can provision the entire academic hierarchy using the **Bulk Data System**.

### 2. HOD (Head of Department) - Sub-Admin
*   **Permissions:** Department-restricted management.
*   **Scope:** Only visible data and controls pertaining to their assigned `departmentId`.

### 3. Faculty Portal
*   **Scope:** Management of assigned academic loads and student success tracking.

### 4. Student Portal
*   **Scope:** Personal academic journey, bio-data management, and performance analytics.

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
