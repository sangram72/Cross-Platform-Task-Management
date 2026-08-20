
import React, { useEffect } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { getAuth, onAuthStateChanged, type User as FirebaseUser } from '@react-native-firebase/auth';

import AuthStack from './AuthStack';
import AppStack from './AppStack';
import { SplashScreen } from '../screens/SplashScreen';
import { useAppDispatch, useAppSelector } from '../store';
import { setUser } from '../store/slices/authSlice';
import { clearTasks } from '../store/slices/taskSlice';
import { initDatabase } from '../database/sqlite';

export default function RootNavigator() {
  const dispatch = useAppDispatch();
  const { user, isInitialized } = useAppSelector(state => state.auth);
  const isDark = useAppSelector(state => state.theme.isDark);

  useEffect(() => {
    initDatabase();

    const authInstance = getAuth();
    const unsubscribe = onAuthStateChanged(authInstance, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        dispatch(setUser({ uid: firebaseUser.uid, email: firebaseUser.email }));
      } else {
        dispatch(setUser(null));
        dispatch(clearTasks());
      }
    });

    return unsubscribe;
  }, [dispatch]);

  if (!isInitialized) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer theme={isDark ? DarkTheme : DefaultTheme}>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}