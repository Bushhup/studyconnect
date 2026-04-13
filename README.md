# 🎓 StudyConnect: Enterprise Academic Ecosystem

StudyConnect is a high-performance, hierarchical institutional management platform designed for modern academic environments. It provides a unified command center for Administrators, specialized sub-management for HODs, professional tools for Faculty, and a data-rich experience for Students.

---

## 🏛️ Institutional Architecture & Hierarchy

The platform is built on a **Hierarchical Academic Model**, ensuring data integrity and logical navigation from the top-level institution down to individual student performance.

1.  **Academic Divisions (Departments):** The primary organizational unit. Manages assigned Faculty, Students, Classes, and Curriculum.
2.  **Academic Sections (Classes):** Academic cohorts within a department. Maps specific students to subject handlers (faculty).
3.  **Rosters & Ledgers:** The final node where individual attendance, marks, and verified biographical data (Bio-Data) are managed.

---

## 🗺️ Portal Modules & Functions

### 👑 Admin & HOD Portal (`/admin`)
The master management suite. HODs (Head of Departments) access a version of this portal filtered specifically to their `departmentId`.

*   **Institutional Dashboard:** High-level oversight using Recharts. Tracks enrollment distributions (Pie Chart) and institutional growth trends (Area Chart).
*   **Architecture Hub (Departments):** The root of the hierarchy. Used to provision new divisions and assign HODs.
*   **Identity Hub (Users):** A centralized directory for access control.
    *   *Faculty Directory:* Manage staff profiles and departmental mapping.
    *   *Student Directory:* Access enrollment status and student identities.
    *   *Bio-Data Registry:* View verified biographical records (Family, ID, Contact).
*   **Academic Results (Marks):** A hierarchical leaderboard. Ranks departments by performance; drills down into class-wise and student-wise ledgers.
*   **Attendance Hub:** Real-time monitoring of institutional presence with "At-Risk" threshold alerts.
*   **Curriculum Management:** Define course credits, syllabus codes, and degree requirements.
*   **System Operations:** Access system logs (audit trail), broadcast institutional notifications, and manage visual configurations.

### 👨‍🏫 Faculty Portal (`/faculty`)
Designed for handling daily academic loads and student success tracking.

*   **Teaching Hub:**
    *   *My Classes:* View assigned sections, timings, and classroom allocations.
    *   *Students:* Directory of students enrolled specifically in the faculty's handled subjects.
*   **Academic Operations:**
    *   *Attendance Ledger:* Session-wise presence recording with "Late" and "Absent" toggles.
    *   *Grade Entry:* Portal for CAT-1, CAT-2, and Model exam mark entry.
    *   *Assignment Center:* Create tasks, set deadlines, and manage student submissions.
    *   *Study Resources:* Repository for uploading lecture notes and reference materials.
*   **Engagement Tools:** Broadcast announcements to specific sections and manage a personal teaching calendar.

### 🎓 Student Portal (`/student`)
A personal academic workspace for the student's journey.

*   **Academic Journey:**
    *   *My Curriculum:* Interactive view of active courses and assigned faculty.
    *   *Attendance Tracking:* Real-time monitoring of presence percentages per subject.
    *   *Marks & Results:* View internal assessment scores and official end-semester grade cards.
    *   *Performance Deep-Dive:* Analytical charts showing GPA progression and credit weightage.
*   **Task Management:**
    *   *Assignments:* Digital submission portal for academic tasks.
    *   *Resources:* Download center for faculty-shared notes and lab manuals.
*   **My Identity:** Self-service biographical registry (Bio Data) which locks after verified submission.

---

## 🚀 Key Platform Features

### 📊 Beautiful Analytics
Integrated **Recharts** visualizations across all dashboards:
*   **Enrollment Split:** Multi-color Pie charts showing student distribution.
*   **GPA Trends:** Area charts with lush gradients for performance tracking.
*   **Leaderboards:** Vertical bar charts ranking departments by success score.

### 📂 Bulk Data Management
Standardized CSV system for high-volume operations:
*   **Downloadable Templates:** Every admin module provides a formatting guide.
*   **Smart Imports:** Onboard thousands of users, students, or grades via CSV upload.

### 🎨 Modular Visual Identity
Users can personalize their entire portal experience via the **Visual Builder**:
*   **Workspace Backgrounds:** Stellar Black, Midnight Navy, Paper White, or Cloud Gray.
*   **Primary Accents:** Ocean Blue, Forest Green, Deep Purple, Golden Sun, or Velvet Rose.
*   **Nav Hub Styles:** 
    *   *Orbital Wheel:* A circular rotating carousel of icons.
    *   *Linear Dynamic:* A draggable, looping track that aligns to the screen edge.

### 🔍 Institutional Command Center
The header search bar acts as a global index. Users can search for any portal module (e.g., "Grades," "Bio Data," "Syllabus") to navigate instantly.

---

## 🛠️ Technical Stack
*   **Frontend:** Next.js 15 (App Router), React 19, Tailwind CSS.
*   **UI Components:** Shadcn UI (Radix Primitives).
*   **Backend:** Firebase (Auth, Firestore).
*   **Data Flow:** Client-side Firestore hooks with non-blocking optimistic updates.
*   **Mobile:** Capacitor 7 integration for native mobile builds.
*   **Animations:** Framer Motion for high-fidelity interactive transitions.
