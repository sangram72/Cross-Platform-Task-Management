import React from 'react';
import { TextInput, TextInputProps, StyleSheet } from 'react-native';

export const CustomInput: React.FC<TextInputProps> = props => {
  return (
    <TextInput
      style={styles.input}
      placeholderTextColor="#94A3B8"
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    color: '#0F172A',
  },
});