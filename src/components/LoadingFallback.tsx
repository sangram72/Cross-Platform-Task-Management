
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export const LoadingFallback: React.FC = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#2563EB" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
});