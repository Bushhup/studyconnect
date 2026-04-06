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

## 9. Feasibility Study
- **Technical:** Uses industry-standard frameworks (Next.js, Firebase) with high stability.
- **Economical:** Serverless architecture reduces physical infrastructure costs.
- **Operational:** Intuitive mobile-first UI requires minimal training.

## 10. List of Modules
1. Admin Command Center
2. Faculty Management Suite
3. Student Success Portal
4. Institutional Identity Module
5. Content Management System

## 11. Modules Definition
- **Admin Portal:** High-level dashboard for user provisioning and institutional analytics.
- **Faculty Suite:** Toolkit for managing class loads, attendance, and grading.
- **Student Portal:** Personal workspace for tracking academic progress and materials.

## 12. Literature Survey
A study of existing LMS like Moodle/Canvas reveals a gap in lightweight ERPs that combine academic management with real-time campus engagement.

## 13. Architecture Diagram
`[ User Clients ] <---> [ Next.js App Router ] <---> [ Firebase SDK ]`

## 14. UML Diagrams
Detailed diagrams including Use Case, Class, Sequence, Activity, and State Chart representations are documented in the system design specifications.

## 15. Detailed Description of Modules
- **User Management:** Full CRUD operations for institutional accounts.
- **Grading Portal:** Real-time mark entry and SGPA calculation.
- **Workspace Builder:** Modular theming for background and accent customization.

## 16. Algorithms / Techniques Used
- **Optimistic UI:** Local state updates for zero-latency interactions.
- **Modular Theming Engine:** HSL-based CSS variable swapping.
- **RBAC Middleware:** Logic ensuring role-restricted route access.

## 17. Complete Screenshots
*(Simulated in Demo Mode at the live URL)*

## 18. Conclusion
StudyConnect centralizes institutional data and provides a premium user interface to eliminate the inefficiencies of legacy systems.

## 19. Future Enhancement
- **AI Predictive Grading:** Using Genkit to predict student outcomes.
- **Biometric Attendance:** Mobile-based facial recognition integration.

## 20. References
- *Next.js Documentation*
- *Firebase Firestore Security Models*
- *Tailwind CSS Design Systems*

---

## 🛠️ Mobile Setup & Troubleshooting

### Fixing `ERR_SDK_NOT_FOUND`
If you encounter the error `ERR_SDK_NOT_FOUND: No valid Android SDK root found`, it means Capacitor cannot find your Android development tools. Follow these steps to resolve it:

#### 1. Identify your SDK Path
- Open **Android Studio**.
- Go to **Settings** (or **Preferences** on macOS).
- Navigate to **Languages & Frameworks > Android SDK**.
- Copy the path shown under **Android SDK Location** (e.g., `C:\Users\Name\AppData\Local\Android\Sdk` or `/Users/Name/Library/Android/sdk`).

#### 2. Configure Environment Variables

**For Windows:**
1. Open the **Start Menu**, search for "Edit the system environment variables", and open it.
2. Click **Environment Variables**.
3. Under **User variables**, click **New**:
   - Variable name: `ANDROID_HOME`
   - Variable value: [Paste your SDK path here]
4. Find the `Path` variable, click **Edit**, and then **New**. Add these two entries:
   - `%ANDROID_HOME%\platform-tools`
   - `%ANDROID_HOME%\emulator`
5. Restart your terminal or command prompt.

**For macOS / Linux:**
1. Open your shell profile file (e.g., `~/.zshrc` or `~/.bash_profile`).
2. Add the following lines:
   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```
3. Save and run `source ~/.zshrc` (or your respective file).

#### 3. Verify and Run
Run `npx cap doctor`. Once Android shows a green checkmark, you can run the build:
```bash
npm run static && npx cap sync android && npx cap run android
```

---

## 🔑 Demonstration Access
- **Portal:** [https://studyconnect-taupe.vercel.app/login](https://studyconnect-taupe.vercel.app/login)
- **Username:** `demo` | **Password:** `demo123`
