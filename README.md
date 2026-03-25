# 🎓 StudyConnect: Enterprise Academic Ecosystem

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Vercel](https://img.shields.io/badge/Vercel-Live-success?style=for-the-badge&logo=vercel)](https://studyconnect-taupe.vercel.app)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![ShadCN UI](https://img.shields.io/badge/ShadCN_UI-Latest-black?style=for-the-badge&logo=shadcnui)](https://ui.shadcn.com/)
[![Firebase](https://img.shields.io/badge/Firebase-11-FFCA28?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![Capacitor](https://img.shields.io/badge/Capacitor-7-blue?style=for-the-badge&logo=capacitor)](https://capacitorjs.com/)

---

## 📄 Abstract
**StudyConnect** is a comprehensive enterprise academic management ecosystem designed to bridge the digital divide between institutional administrators, faculty, and students. By leveraging real-time cloud synchronization and a unified identity management system, it streamlines complex academic workflows into a seamless, high-performance experience across web and mobile platforms. The system prioritizes data integrity, granular access control, and intuitive user interaction to foster a collaborative learning environment.

## 📝 Description
The platform serves as a centralized hub for institutional intelligence, transforming traditional school management into a data-driven digital experience. 

StudyConnect architecture is divided into three specialized portals:
- **Administrative Command Center:** A "Master Portal" for oversight, providing tools for identity management (provisioning institutional usernames), academic structuring (departments, courses, sections), and high-level analytics on institutional performance.
- **Faculty Management Suite:** A comprehensive toolkit for educators to manage their academic loads. It includes digital ledgers for real-time attendance, grade synchronization, and broadcast tools for targeted student communications.
- **Student Success Portal:** An analytical workspace for the modern learner. Students can track their CGPA momentum, monitor attendance compliance, access digital study materials, and stay updated via a consolidated campus timeline.

Built with **Next.js 15 (App Router)**, **Firebase Firestore (Real-time NoSQL)**, and **Capacitor 7**, the application provides a native app experience on mobile devices while maintaining a high-fidelity desktop web portal. The design philosophy centers on premium interaction, featuring a signature 3D-rotating navigation hub and responsive data visualizations.

---

## 🔗 Live Production
The project is deployed and accessible at:  
**[https://studyconnect-taupe.vercel.app](https://studyconnect-taupe.vercel.app)**

---

## ✨ Design Philosophy

The project adheres to modern SaaS design principles, emphasizing:
- **Premium Interaction:** Features a signature **3D-Rotating Floating Navigation Hub** with "Expanding Pill" animations that adapt to mobile and desktop viewports.
- **Data-Driven Visuals:** Complex institutional data is rendered via **Recharts** into beautiful, high-contrast analytics.
- **Cross-Platform Excellence:** Powered by **Capacitor**, providing a native app experience on mobile devices while maintaining a high-fidelity desktop web portal.
- **Consistency:** Powered by **ShadCN UI** and **Tailwind CSS**, ensuring a unified design language across specialized modules.

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

### 📤 Push to GitHub
1. Initialize git repository:
   ```bash
   git init
   ```
2. Add all files:
   ```bash
   git add .
   ```
3. Create initial commit:
   ```bash
   git commit -m "Initial commit: StudyConnect Enterprise Ecosystem"
   ```
4. Set branch to main and add remote:
   ```bash
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   ```
5. Push to GitHub:
   ```bash
   git push -u origin main
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

- **Portal:** [https://studyconnect-taupe.vercel.app/login](https://studyconnect-taupe.vercel.app/login)
- **Username:** `demo`
- **Password:** `demo123`

*Note: Administrative controls are restricted in demo sessions to protect institutional integrity.*

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Developed with ❤️ for the future of education.
