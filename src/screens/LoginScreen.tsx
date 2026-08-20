// src/screens/auth/LoginScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { firebaseSignIn, firebaseSignUp } from '../services/authService';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';

type LoadingAction = 'signin' | 'signup' | null;

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loadingAction, setLoadingAction] = useState<LoadingAction>(null);

  const getFriendlyErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Invalid email or password. If you are new, tap "Create Account".';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists. Please sign in.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/weak-password':
        return 'Password must be at least 6 characters long.';
      case 'auth/network-request-failed':
        return 'Network connection issue. Please check your internet.';
      default:
        return 'Authentication failed. Please try again.';
    }
  };

  const handleAuth = async (action: 'signin' | 'signup') => {
    const cleanedEmail = email.trim();
    const cleanedPassword = password.trim();

    if (!cleanedEmail || !cleanedPassword) {
      Alert.alert('Validation Error', 'Please enter both email and password.');
      return;
    }

    try {
      setLoadingAction(action);
      if (action === 'signup') {
        await firebaseSignUp({ email: cleanedEmail, password: cleanedPassword });
      } else {
        await firebaseSignIn({ email: cleanedEmail, password: cleanedPassword });
      }
    } catch (error: any) {
      const message = error?.code
        ? getFriendlyErrorMessage(error.code)
        : error.message || 'Authentication failed.';
      Alert.alert('Notice', message);
    } finally {
      setLoadingAction(null);
    }
  };

  const isBusy = loadingAction !== null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.iconBadge}>
              <Text style={styles.iconText}>✓</Text>
            </View>
            <Text style={styles.title}>Welcome</Text>
            <Text style={styles.subtitle}>
              Sign in to sync your tasks across all devices
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            <Text style={styles.label}>Email</Text>
            <CustomInput
              placeholder="name@example.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
              editable={!isBusy}
            />

            <Text style={styles.label}>Password</Text>
            <CustomInput
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isBusy}
            />

            <View style={styles.buttonContainer}>
              <CustomButton
                title="Sign In"
                onPress={() => handleAuth('signin')}
                loading={loadingAction === 'signin'}
                disabled={isBusy}
                variant="primary"
              />

              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <CustomButton
                title="Create an Account"
                onPress={() => handleAuth('signup')}
                loading={loadingAction === 'signup'}
                disabled={isBusy}
                variant="secondary"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  iconBadge: {
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  iconText: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
    marginLeft: 2,
  },
  buttonContainer: {
    marginTop: 6,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    marginHorizontal: 12,
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '500',
  },
});