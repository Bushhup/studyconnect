# 🎓 StudyConnect: Enterprise Academic Ecosystem

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Vercel](https://img.shields.io/badge/Vercel-Live-success?style=for-the-badge&logo=vercel)](https://studyconnect-taupe.vercel.app)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-11-FFCA28?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![Capacitor](https://img.shields.io/badge/Capacitor-7-blue?style=for-the-badge&logo=capacitor)](https://capacitorjs.com/)

---

## 🛠️ Mobile Setup & Troubleshooting

### Fixing `ERR_SDK_NOT_FOUND`
If you encounter the error `ERR_SDK_NOT_FOUND: No valid Android SDK root found`, it means Capacitor cannot locate the Android build tools on your machine. Follow these steps:

#### 1. Identify your SDK Path
- Open **Android Studio**.
- Go to **Settings** (or **Preferences** on macOS).
- Navigate to **Languages & Frameworks > Android SDK**.
- Copy the **Android SDK Location** path (e.g., `C:\Users\Name\AppData\Local\Android\Sdk`).

#### 2. Configure Environment Variables (Windows)
1. Open the **Start Menu**, search for "Edit the system environment variables" and open it.
2. Click **Environment Variables**.
3. Under **User variables**, click **New**:
   - Variable name: `ANDROID_HOME`
   - Variable value: [Paste your SDK path here]
4. Find the **Path** variable in the same list, click **Edit**, and then **New**. Add these two entries:
   - `%ANDROID_HOME%\platform-tools` (Enables `adb` for device communication)
   - `%ANDROID_HOME%\emulator` (Allows the CLI to start virtual devices)
5. **Restart your terminal/IDE** for changes to take effect.

#### 3. Configure Environment Variables (macOS / Linux)
Add these lines to your `~/.zshrc` or `~/.bash_profile`:
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```
Run `source ~/.zshrc` to apply.

---

## 🔑 Demonstration Access
- **Portal:** [https://studyconnect-taupe.vercel.app/login](https://studyconnect-taupe.vercel.app/login)
- **Username:** `demo` | **Password:** `demo123`
