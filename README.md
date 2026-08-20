Absolutely. I’d make it read like a developer actually wrote the README, rather than a generated technical document. I’d also remove the unnecessary sections and keep the environment/run instructions clear.

# Offline Task Manager

A simple and responsive task manager built with React Native.

The app is designed with an offline-first approach, so users can create, update, complete, and delete tasks even without an internet connection. Tasks are stored locally using SQLite and are automatically synchronized with Firebase Firestore when the device comes back online.

---

## How It Works

The main idea behind the application is to keep the app responsive even when the network is slow or unavailable.

Instead of depending on the server for every action, the app works primarily with the local database.

1. **Local SQLite as the source of truth**

   When a user creates, updates, completes, or deletes a task, the change is first saved to the local SQLite database. Redux is then updated so the UI reflects the change immediately.

2. **Background synchronization**

   When the device is offline, changes are kept locally and marked as pending.

   Once the device comes back online, the sync process detects the network connection and sends the pending changes to Firebase Firestore.

   The app also uses Firestore `onSnapshot` to receive changes made from other devices and update the local database accordingly.

3. **Logout cleanup**

   When a user logs out, the application removes active Firestore listeners, cancels scheduled notifications, removes the push notification token, and clears the user's Redux state.

---

## Tech Stack

* React Native
* TypeScript
* Redux Toolkit
* React-Redux
* SQLite (`@op-engineering/op-sqlite`)
* Firebase Authentication
* Firebase Cloud Firestore
* Firebase Cloud Messaging
* Notifee
* React Native NetInfo
* React Native Config

---

## Getting Started

### Prerequisites

Before running the project, make sure you have the React Native development environment configured.

You will need:

* Node.js
* Android Studio and Android SDK for Android development
* Xcode for iOS development
* CocoaPods for iOS dependencies
* Android emulator or physical Android device
* iOS simulator or physical iOS device

### Install Dependencies

After cloning the project, install the dependencies:

```bash
npm install
```

For iOS, install the CocoaPods dependencies:

```bash
cd ios
pod install
cd ..
```

---

## Environment Configuration

The application has three environments:

* Development
* Staging
* Production

Environment-specific values are managed using `react-native-config`.

Make sure the required configuration is available for the environment you want to run.

The general setup is:

```text
Development -> Development configuration
Staging     -> Staging configuration
Production  -> Production configuration
```

Production credentials and other sensitive configuration values should not be committed to the repository.

---

## Running the Application

The project has separate scripts for Development, Staging, and Production.

### Development

Development is the environment normally used while working on the application.

#### Android

First start Metro:

```bash
npm start
```

Then, in another terminal:

```bash
npm run android:dev
```

This runs the Android `devDebug` build.

#### iOS

Start Metro:

```bash
npm start
```

Then run:

```bash
npm run ios:dev
```

This runs the iOS `Dev` scheme.

---

### Staging

Staging is used for QA and testing features before they are released to production.

#### Android

```bash
npm run android:staging
```

This runs the Android `stagingDebug` build.

#### iOS

```bash
npm run ios:staging
```

This runs the iOS `Staging` scheme.

---

### Production

Production is used for the production configuration and release testing.

#### Android

```bash
npm run android:prod
```

This runs the Android `prodRelease` build.

#### iOS

```bash
npm run ios:prod
```

This runs the iOS `Prod` scheme.

Production builds may require the appropriate Android keystore, iOS certificates, provisioning profiles, and production environment configuration.

---

## Available Scripts

| Script                    | Description                            |
| ------------------------- | -------------------------------------- |
| `npm start`               | Starts the Metro bundler               |
| `npm run android`         | Runs the default Android configuration |
| `npm run android:dev`     | Runs the Android development build     |
| `npm run android:staging` | Runs the Android staging build         |
| `npm run android:prod`    | Runs the Android production build      |
| `npm run ios`             | Runs the default iOS configuration     |
| `npm run ios:dev`         | Runs the iOS development scheme        |
| `npm run ios:staging`     | Runs the iOS staging scheme            |
| `npm run ios:prod`        | Runs the iOS production scheme         |
| `npm run lint`            | Runs ESLint                            |
| `npm test`                | Runs Jest tests                        |

---

## Project Structure

```text
src/
├── components/          # Reusable UI components
├── config/              # Environment configuration
├── database/            # SQLite setup and sync logic
├── navigation/          # Authentication and application navigation
├── screens/
│   ├── app/             # Task-related screens
│   └── auth/            # Login and sign-up screens
├── services/            # Firebase and notification services
├── store/               # Redux slices and store configuration
├── theme/               # Light and dark themes
└── types/               # TypeScript types and interfaces
```

---

## Offline Behavior

The application can be used without an internet connection.

When offline, task changes are saved locally in SQLite. These changes are kept as pending operations until a network connection is available.

Once the device is back online, the application automatically synchronizes the pending changes with Firestore.

This means users can continue working with their tasks without having to wait for a network request to complete.

---

## Notifications

The application uses Notifee for local task reminders and Firebase Cloud Messaging for push notifications.

When a user logs out, the application performs the required cleanup, including removing active listeners, cancelling scheduled reminders, removing the push token, and clearing the local authentication state.

---

## Testing

To run the linter:

```bash
npm run lint
```

To run the Jest test suite:

```bash
npm test
```

---

## Build Configurations

The project currently uses the following configurations:

| Environment | Android Configuration | iOS Scheme |
| ----------- | --------------------- | ---------- |
| Development | `devDebug`            | `Dev`      |
| Staging     | `stagingDebug`        | `Staging`  |
| Production  | `prodRelease`         | `Prod`     |

---

## Quick Start

For normal development, install the dependencies and start the application:

```bash
npm install
npm start
```

Then run the platform you need.

Android:

```bash
npm run android:dev
```

iOS:

```bash
npm run ios:dev
```

For staging:

```bash
npm run android:staging
```

or:

```bash
npm run ios:staging
```

For production:

```bash
npm run android:prod
```

or:

```bash
npm run ios:prod
```
