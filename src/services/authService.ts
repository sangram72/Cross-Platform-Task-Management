
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from '@react-native-firebase/auth';
import { NotificationService } from './notificationService';
import { SyncEngine } from '../database/syncEngine';

interface AuthCredentials {
  email: string;
  password: string;
}

export const firebaseSignIn = async ({ email, password }: AuthCredentials) => {
  const auth = getAuth();
  return await signInWithEmailAndPassword(auth, email, password);
};

export const firebaseSignUp = async ({ email, password }: AuthCredentials) => {
  const auth = getAuth();
  return await createUserWithEmailAndPassword(auth, email, password);
};

export const firebaseSignOut = async () => {
  try {
    // Teardown device notifications and stop remote pushes
    await NotificationService.cancelAllReminders();

    // Kill real-time Firestore listeners and NetInfo network listeners
    SyncEngine.cleanup();

    // Sign out from Firebase
    const auth = getAuth();
    await signOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};