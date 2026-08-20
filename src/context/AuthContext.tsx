
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, type User as FirebaseUser } from '@react-native-firebase/auth';
import { AuthContextType, AuthCredentials, User } from '../types';
import { firebaseSignIn, firebaseSignUp, firebaseSignOut } from '../services/authService';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser: FirebaseUser | null) => {
      setUser(currentUser);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (credentials: AuthCredentials) => {
    await firebaseSignIn(credentials);
  };

  const signUp = async (credentials: AuthCredentials) => {
    await firebaseSignUp(credentials);
  };

  const signOut = async () => {
    await firebaseSignOut();
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};