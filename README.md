# Offline Task Manager

A simple, snappy task manager built with React Native. It works completely offline, saves your tasks instantly to a local SQLite database, and syncs everything with Firebase Firestore whenever you're connected to the internet.

---

## 💡 How It Works (Architecture)

The goal here was simple: **make the app feel instant and never make the user wait on network calls.**

Instead of talking directly to an API every time you tap a button, the app follows a local-first pattern:

1. **Local SQLite is the Source of Truth:** Whenever you create, edit, or delete a task, it writes directly to the local SQLite database and updates Redux right away. The UI updates instantly with zero loading spinners for basic actions.
2. **Background Sync Engine:** A dedicated sync helper runs in the background. It watches your internet connection:
   - **Going Online:** It looks for any local changes marked as pending and pushes them up to Firestore.
   - **Realtime Listener:** It listens for changes from Firestore (like edits from another device) and quietly updates your local database.
3. **Clean Teardown on Logout:** When you log out, it cleanly shuts down active Firestore listeners, cancels pending local reminders, deletes the push token, and clears the local state so the next account starts fresh.

---

## 🛠️ Tech Stack

- **Framework:** React Native (`0.87x`)
- **State Management:** Redux Toolkit & React-Redux
- **Local Storage:** `@op-engineering/op-sqlite` (chosen for speed and direct SQLite access)
- **Backend & Auth:** Firebase (Authentication, Cloud Firestore, Cloud Messaging)
- **Local Reminders:** `@notifee/react-native` (handles scheduled notifications and Android channels)
- **Network Monitoring:** `@react-native-community/netinfo`
- **Environment Management:** `react-native-config`

---

## 📁 Project Structure

Here is a quick look at where everything lives:

```text
src/
├── components/          # Reusable UI elements (buttons, inputs, task cards)
├── config/              # Environment config wrapper (env.ts)
├── database/            # SQLite setup & the background sync engine
├── navigation/          # React Navigation stacks (Auth & Main App)
├── screens/
│   ├── app/             # TaskList and TaskDetail screens
│   └── auth/            # Login and Sign-up screens
├── services/            # Firebase Auth & Notifee notification logic
├── store/               # Redux slices (tasks, auth, theme, ui)
├── theme/               # Light and dark color palettes
└── types/               # TypeScript interfaces
