# 🎓 StudyConnect: Enterprise Academic Ecosystem

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![ShadCN UI](https://img.shields.io/badge/ShadCN_UI-Latest-black?style=for-the-badge&logo=shadcnui)](https://ui.shadcn.com/)
[![Firebase](https://img.shields.io/badge/Firebase-11-FFCA28?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![Capacitor](https://img.shields.io/badge/Capacitor-7-blue?style=for-the-badge&logo=capacitor)](https://capacitorjs.com/)

**StudyConnect** is a state-of-the-art institutional management platform designed to bridge the gap between administrators, faculty, and students. Built with a focus on **Professional UI/UX**, the application provides a seamless, high-performance experience for complex academic workflows across Web, Android, and iOS.

---

## ✨ Design Philosophy

The project adheres to modern SaaS design principles, emphasizing:
- **Premium Interaction:** Features a signature **3D-Rotating Floating Navigation Hub** with "Expanding Pill" animations that adapt to mobile and desktop viewports.
- **Data-Driven Visuals:** Complex institutional data is rendered via **Recharts** into beautiful, high-contrast analytics.
- **Cross-Platform Excellence:** Powered by **Capacitor**, providing a native app experience on mobile devices while maintaining a high-fidelity desktop web portal.
- **Consistency:** Powered by **ShadCN UI** and **Tailwind CSS**, ensuring a unified design language across 40+ specialized modules.

---

## 🏗️ Core Architecture

### 🛡️ Administrative Command Center
The "Master Portal" for institutional oversight.
- **Identity Management:** Granular user provisioning with unique institutional usernames.
- **Academic Structuring:** Dynamic management of Departments, Courses, and Sections.
- **Analytics:** High-level placement trends and student retention metrics.

### 🧑‍🏫 Faculty Management Suite
A comprehensive toolkit for educators.
- **Digital Ledger:** Instant attendance marking and grade synchronization.
- **LMS Integration:** Assignment creation, resource sharing (PDF/Video), and student evaluation.
- **Broadcast Tools:** Targeted announcements for specific classes or semesters.

### 🎓 Student Success Portal
An analytical workspace for the modern learner.
- **Academic Dashboard:** Real-time tracking of GPA momentum and attendance compliance.
- **Official Results:** Digital grade cards and credit evaluation history.
- **Interactive Timeline:** Consolidated calendar for classes, exams, and deadlines.

---

## 🚀 Technical Stack

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript
- **Mobile/Native:** Capacitor 7 (Android/iOS support)
- **Styling:** Tailwind CSS, Framer Motion (Animations)
- **UI Components:** ShadCN UI (Radix Primitive based)
- **Backend/Database:** Firebase Firestore (NoSQL), Firebase Auth
- **Visualization:** Recharts (Analytics & Trends)
- **Icons:** Lucide React

---

## 🛠️ Getting Started

### Prerequisites
- Node.js 20+
- Firebase Project Credentials

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/studyconnect.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env`:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_key
   # ... other firebase config
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### Native Mobile Build
```bash
# Build the web assets
npm run build

# Sync with Capacitor
npx cap sync

# Open in Android Studio / Xcode
npx cap open android
npx cap open ios
```

---

## 🔑 Demonstration Access

The application includes a specialized **Demo Mode** for exploring all portals without manual registration:

- **Portal:** [Login Page](/login)
- **Username:** `demo`
- **Password:** `demo123`

*Note: Administrative controls are restricted in demo sessions to protect institutional integrity.*

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Developed with ❤️ for the future of education.
