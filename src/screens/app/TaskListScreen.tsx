
import React, { useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ListRenderItemInfo,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  loadTasks,
  saveTaskAction,
  deleteTaskAction,
} from '../../store/slices/taskSlice';
import { toggleTheme } from '../../store/slices/themeSlice';
import { SyncEngine } from '../../database/syncEngine';
import { NotificationService } from '../../services/notificationService';
import { firebaseSignOut } from '../../services/authService';
import { TaskItem } from '../../components/TaskItem';
import { Task } from '../../types';
import { lightTheme, darkTheme } from '../../theme/colors';
import { AppStackParamList } from '../../navigation/types';

const ITEM_HEIGHT = 76;

export default function TaskListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const dispatch = useAppDispatch();
  const { tasks, loading } = useAppSelector(state => state.tasks);
  const isDark = useAppSelector(state => state.theme.isDark);
  const user = useAppSelector(state => state.auth.user);
  const colors = isDark ? darkTheme : lightTheme;

  useEffect(() => {
    if (!user) return;

    NotificationService.init();
    dispatch(loadTasks(user.uid));

    const unsubscribe = SyncEngine.init(user.uid, () => {
      dispatch(loadTasks(user.uid));
    });

    return () => unsubscribe();
  }, [user, dispatch]);

  const onRefresh = useCallback(() => {
    if (user) {
      dispatch(loadTasks(user.uid));
      SyncEngine.syncPending(user.uid);
    }
  }, [user, dispatch]);

  const handleToggle = useCallback(
    (task: Task) => {
      dispatch(
        saveTaskAction({
          ...task,
          isCompleted: !task.isCompleted,
          updatedAt: Date.now(),
          syncStatus: 'updated',
        })
      );
    },
    [dispatch]
  );

  const handleDelete = useCallback(
    (id: string) => {
      if (!user) return;
      dispatch(deleteTaskAction({ id, userId: user.uid }));
      NotificationService.cancelReminder(id);
    },
    [dispatch, user]
  );

  const handleEdit = useCallback(
    (task: Task) => {
      navigation.navigate('TaskDetail', { task });
    },
    [navigation]
  );

  const completedCount = useMemo(
    () => tasks.filter(t => t.isCompleted).length,
    [tasks]
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Task>) => (
      <TaskItem
        task={item}
        colors={colors}
        onToggle={handleToggle}
        onDelete={handleDelete}
        onEdit={handleEdit}
      />
    ),
    [colors, handleToggle, handleDelete, handleEdit]
  );

  const keyExtractor = useCallback((item: Task) => item.id, []);

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    []
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      /> */}

      {/* Header Bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={[styles.greeting, { color: colors.subtext }]}>Welcome back 👋</Text>
          <Text style={[styles.header, { color: colors.text }]}>My Tasks</Text>
        </View>

        <View style={styles.actionsGroup}>
          <TouchableOpacity
            onPress={() => dispatch(toggleTheme())}
            style={[
              styles.iconBtn,
              { backgroundColor: isDark ? colors.card : '#EDE9FE' },
            ]}
            activeOpacity={0.75}
          >
            <Text style={styles.actionIcon}>{isDark ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={firebaseSignOut}
            style={[styles.iconBtn, styles.logoutBtn]}
            activeOpacity={0.75}
          >
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress & Stat Banner */}
      <View
        style={[
          styles.summaryCard,
          {
            backgroundColor: isDark ? colors.card : '#FFFFFF',
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.summaryInfo}>
          <Text style={[styles.summaryTitle, { color: colors.text }]}>Task Overview</Text>
          <Text style={[styles.summarySubtitle, { color: colors.subtext }]}>
            {tasks.length === 0
              ? 'No active tasks'
              : `${completedCount} of ${tasks.length} tasks completed`}
          </Text>
        </View>

        <View style={[styles.counterBadge, { backgroundColor: colors.primary }]}>
          <Text style={styles.counterText}>
            {tasks.length > 0 ? `${Math.round((completedCount / tasks.length) * 100)}%` : '0%'}
          </Text>
        </View>
      </View>

      {/* Content Area */}
      {loading && tasks.length === 0 ? (
        <View style={styles.centerLoader}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.subtext }]}>
            Syncing your tasks...
          </Text>
        </View>
      ) : (
        <FlatList
          data={tasks}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          getItemLayout={getItemLayout}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={true}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={[styles.emptyIconCircle, { backgroundColor: isDark ? colors.card : '#F1F5F9' }]}>
                <Text style={styles.emptyIcon}>📝</Text>
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No Tasks Yet</Text>
              <Text style={[styles.emptyText, { color: colors.subtext }]}>
                Tap the floating button below to create your first task and stay organized.
              </Text>
            </View>
          }
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('TaskDetail')}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
    marginBottom: 2,
  },
  header: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  actionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 18,
  },
  logoutBtn: {
    width: 'auto',
    paddingHorizontal: 14,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '700',
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  summaryInfo: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  summarySubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  counterBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  counterText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  listContent: {
    paddingBottom: 110,
    flexGrow: 1,
  },
  centerLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    marginTop: 60,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyIcon: {
    fontSize: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 28,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '400',
    lineHeight: 34,
  },
});