# 🎓 StudyConnect: Enterprise Academic Ecosystem

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Vercel](https://img.shields.io/badge/Vercel-Live-success?style=for-the-badge&logo=vercel)](https://studyconnect-taupe.vercel.app)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-11-FFCA28?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![Capacitor](https://img.shields.io/badge/Capacitor-7-blue?style=for-the-badge&logo=capacitor)](https://capacitorjs.com/)

---

## 1. Project Title
**StudyConnect: A Unified Multi-Portal Academic Management System**

## 2. Abstract
**StudyConnect** is a comprehensive enterprise academic management ecosystem designed to bridge the digital divide between institutional administrators, faculty, and students. By leveraging real-time cloud synchronization via Firebase and a unified identity management system, it streamlines complex academic workflows—such as attendance tracking, grading, and institutional broadcasting—into a seamless, high-performance experience across web and mobile platforms.

## 3. Introduction
In the rapidly evolving landscape of modern education, the need for a centralized "source of truth" for academic data is paramount. StudyConnect serves as a digital nervous system for educational institutions, replacing fragmented communication channels with a unified platform.

## 4. Existing System
Current academic management in many institutions relies on paper-based attendance ledgers, fragmented digital tools (Excel, WhatsApp), and disconnected silos of data.

## 5. Drawbacks of Existing System
- **Data Redundancy:** Manual entry leads to human error.
- **Latency:** Information takes days to reach stakeholders.
- **Security Risks:** Physical records are prone to loss.
- **Lack of Analytics:** Hard to track long-term performance trends.

## 6. Proposed System
**StudyConnect** proposes a cloud-native, real-time platform featuring a unified backend (Firestore), Role-Based Access Control (RBAC), and cross-platform delivery via web and native mobile apps.

## 7. Advantages of Proposed System
- **Real-Time Sync:** Updates reflect across all portals instantly.
- **Data Integrity:** Centralized storage prevents record duplication.
- **Automated Analytics:** Integrated charts provide visual insights into GPA and attendance.
- **Modular Theming:** Users can customize their workspace environment.

## 8. Front End and Back End Details
- **Front End:** Next.js 15, Tailwind CSS, ShadCN UI.
- **Back End:** Firebase Firestore, Firebase Auth.
- **Mobile:** Capacitor 7 (iOS/Android Support).

---

## 🛠️ Mobile Setup & Troubleshooting

### Fixing `ERR_SDK_NOT_FOUND`
If you encounter the error `ERR_SDK_NOT_FOUND: No valid Android SDK root found`, follow these steps:

#### 1. Identify your SDK Path
- Open **Android Studio**.
- Go to **Settings** (or **Preferences** on macOS).
- Navigate to **Languages & Frameworks > Android SDK**.
- Copy the **Android SDK Location** path.

#### 2. Configure Environment Variables

**For Windows:**
1. Open the **Start Menu**, search for "Edit the system environment variables".
2. Click **Environment Variables**.
3. Under **User variables**, click **New**:
   - Variable name: `ANDROID_HOME`
   - Variable value: [Paste your SDK path here]
4. Find the `Path` variable in the same list, click **Edit**, and then **New**. Add these two:
   - `%ANDROID_HOME%\platform-tools`
   - `%ANDROID_HOME%\emulator`
5. Restart your terminal.

**For macOS / Linux:**
Add these lines to your `~/.zshrc` or `~/.bash_profile`:
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```
Run `source ~/.zshrc` to apply.

#### 💡 Why these variables?
- **ANDROID_HOME**: This is the root folder. Capacitor uses this to find the general Android build tools.
- **platform-tools**: This contains `adb` (Android Debug Bridge). It is the "bridge" that lets your computer talk to your phone to install the app.
- **emulator**: This contains the software that runs the virtual phone. Adding it to your Path lets you start emulators directly from the command line.

---

## 🔑 Demonstration Access
- **Portal:** [https://studyconnect-taupe.vercel.app/login](https://studyconnect-taupe.vercel.app/login)
- **Username:** `demo` | **Password:** `demo123`
