
import React, { useState } from 'react';
import {
  View,
  Text,
  
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../store';
import { saveTaskAction } from '../../store/slices/taskSlice';
import { NotificationService } from '../../services/notificationService';
import { Task } from '../../types';
import { lightTheme, darkTheme } from '../../theme/colors';
import { AppStackParamList } from '../../navigation/types';

export default function TaskDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<AppStackParamList, 'TaskDetail'>>();
  const existingTask = route.params?.task;

  const [title, setTitle] = useState(existingTask?.title || '');
  const [description, setDescription] = useState(existingTask?.description || '');
  const [isSaving, setIsSaving] = useState(false);

  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);
  const isDark = useAppSelector(state => state.theme.isDark);
  const colors = isDark ? darkTheme : lightTheme;

  const handleSave = async () => {
    if (!title.trim() || !user || isSaving) return;
    setIsSaving(true);

    try {
      const now = Date.now();
      const task: Task = {
        id: existingTask?.id || now.toString(),
        userId: user.uid,
        title: title.trim(),
        description: description.trim(),
        isCompleted: existingTask?.isCompleted || false,
        createdAt: existingTask?.createdAt || now,
        updatedAt: now,
        syncStatus: existingTask ? 'updated' : 'created',
      };

      await dispatch(saveTaskAction(task)).unwrap();
      await NotificationService.scheduleReminder(task.id, task.title, now + 10000);
      navigation.goBack();
    } catch (error) {
      console.error('Failed to save task:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const isFormValid = title.trim().length > 0;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Top Header Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backBtn, { backgroundColor: isDark ? colors.card : '#F1F5F9' }]}
          activeOpacity={0.75}
          disabled={isSaving}
        >
          <Text style={[styles.backBtnText, { color: colors.text }]}>←</Text>
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {existingTask ? 'Edit Task' : 'New Task'}
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Card Container */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: isDark ? colors.card : '#FFFFFF',
                borderColor: colors.border,
              },
            ]}
          >
            {/* Title Section */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={[styles.label, { color: colors.text }]}>Title</Text>
                <Text style={[styles.requiredBadge, { color: colors.primary }]}>Required</Text>
              </View>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? colors.background : '#F8FAFC',
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="What needs to be done?"
                placeholderTextColor={colors.subtext}
                value={title}
                onChangeText={setTitle}
                editable={!isSaving}
                autoFocus={!existingTask}
              />
            </View>

            {/* Description Section */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={[styles.label, { color: colors.text }]}>Description</Text>
                <Text style={[styles.optionalBadge, { color: colors.subtext }]}>Optional</Text>
              </View>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  {
                    backgroundColor: isDark ? colors.background : '#F8FAFC',
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="Add additional notes or details..."
                placeholderTextColor={colors.subtext}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={5}
                editable={!isSaving}
              />
            </View>

            {/* Reminder Info Banner */}
            <View
              style={[
                styles.infoBox,
                {
                  backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF',
                  borderColor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#DBEAFE',
                },
              ]}
            >
              <Text style={styles.infoIcon}>🔔</Text>
              <Text style={[styles.infoText, { color: colors.primary }]}>
                A reminder notification will trigger automatically shortly after saving.
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Floating Save Button Bar */}
        <View
          style={[
            styles.bottomActionContainer,
            {
              backgroundColor: colors.background,
              borderTopColor: colors.border,
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.saveBtn,
              { backgroundColor: colors.primary },
              (!isFormValid || isSaving) && styles.disabledBtn,
            ]}
            onPress={handleSave}
            activeOpacity={0.85}
            disabled={!isFormValid || isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.saveText}>
                {existingTask ? 'Update Task' : 'Create Task'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    fontSize: 20,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  headerSpacer: {
    width: 40,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 24,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
  },
  requiredBadge: {
    fontSize: 12,
    fontWeight: '600',
  },
  optionalBadge: {
    fontSize: 12,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    marginTop: 4,
  },
  infoIcon: {
    fontSize: 16,
  },
  infoText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
    lineHeight: 18,
  },
  bottomActionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  saveBtn: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledBtn: {
    opacity: 0.5,
    elevation: 0,
    shadowOpacity: 0,
  },
  saveText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.2,
  },
});