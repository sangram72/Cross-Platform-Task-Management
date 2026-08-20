
import type { User as FirebaseUser } from '@react-native-firebase/auth';

export interface UserProfile {
  uid: string;
  email: string | null;
}

export type User = FirebaseUser | null;

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthContextType {
  user: User;
  isLoading: boolean;
  signIn: (credentials: AuthCredentials) => Promise<void>;
  signUp: (credentials: AuthCredentials) => Promise<void>;
  signOut: () => Promise<void>;
}

export type SyncStatus = 'synced' | 'created' | 'updated' | 'deleted';

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  dueDate?: number;
  createdAt: number;
  updatedAt: number;
  syncStatus: SyncStatus;
}

export interface ThemePalette {
  background: string;
  card: string;
  text: string;
  subtext: string;
  border: string;
  primary: string;
  danger: string;
  success: string;
}