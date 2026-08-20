Offline Task Manager

A simple, snappy task manager built with React Native. It works completely offline, saves tasks locally to an SQLite database, and syncs automatically with Firebase Firestore whenever you have an active internet connection.

---

## 💡 How It Works (Architecture)

The main goal was to **make the app feel instant and never make the user wait on network requests.**

Instead of querying a remote API for every action, the app uses an offline-first workflow:

1. **Local SQLite is the Source of Truth:** Whenever you create, update, toggle, or delete a task, it writes immediately to the local SQLite database and updates the Redux store. The UI updates instantly with zero loading spinners.
2. **Background Sync Engine:** A dedicated sync helper runs in the background to monitor network connectivity:
   - **Going Online:** Detects network restoration, collects all pending changes (`created`, `updated`, `deleted`), and batches them up to Firestore.
   - **Realtime Sync:** Uses a Firestore `onSnapshot` listener to pull remote changes (such as edits made on another device) and quietly updates SQLite.
3. **Clean Teardown on Logout:** Signing out unsubscribes active Firestore listeners, cancels pending local reminders, deletes the push token, and clears the local Redux state clean.

---

## 🛠️ Tech Stack

- **Framework:** React Native
- **State Management:** Redux Toolkit & React-Redux
- **Local Database:** `@op-engineering/op-sqlite`
- **Backend & Auth:** Firebase (Authentication, Cloud Firestore, Cloud Messaging)
- **Local Notifications:** `@notifee/react-native`
- **Network Monitoring:** `@react-native-community/netinfo`
- **Environment Management:** `react-native-config`

---

## 📁 Project Structure

```text
src/
├── components/          # Reusable UI elements (CustomButton, CustomInput, TaskItem)
├── config/              # Environment config wrapper (env.ts)
├── database/            # SQLite setup & the background sync engine
├── navigation/          # React Navigation stacks (AuthStack & AppStack)
├── screens/
│   ├── app/             # TaskList and TaskDetail screens
│   └── auth/            # Login and Sign-up screens
├── services/            # Firebase Auth & Notifee notification logic
├── store/               # Redux slices (tasks, auth, theme, ui)
├── theme/               # Light and dark color palettes
└── types/               # TypeScript interfaces
