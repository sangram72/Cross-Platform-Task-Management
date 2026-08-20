import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Task, ThemePalette } from '../types';

interface Props {
  task: Task;
  colors: ThemePalette;
  onToggle: (task: Task) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

export const TaskItem = memo(
  ({ task, colors, onToggle, onDelete, onEdit }: Props) => {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <TouchableOpacity
          onPress={() => onToggle(task)}
          style={styles.checkArea}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.check,
              { color: task.isCompleted ? colors.success : colors.subtext },
            ]}
          >
            {task.isCompleted ? '✓' : '○'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onEdit(task)}
          style={styles.titleArea}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.title,
              { color: colors.text },
              task.isCompleted && styles.completedText,
            ]}
            numberOfLines={1}
          >
            {task.title}
          </Text>
          {task.syncStatus !== 'synced' && (
            <Text style={styles.syncBadge}>• Pending sync</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onDelete(task.id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.7}
        >
          <Text style={[styles.deleteBtn, { color: colors.danger }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    );
  },
  (prev, next) =>
    prev.task.id === next.task.id &&
    prev.task.isCompleted === next.task.isCompleted &&
    prev.task.title === next.task.title &&
    prev.task.syncStatus === next.task.syncStatus &&
    prev.colors === next.colors
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
    height: 64,
  },
  checkArea: { paddingRight: 10 },
  check: { fontSize: 20, fontWeight: 'bold' },
  titleArea: { flex: 1 },
  title: { fontSize: 16, fontWeight: '500' },
  completedText: { textDecorationLine: 'line-through', opacity: 0.5 },
  syncBadge: { fontSize: 11, color: '#F59E0B', marginTop: 2 },
  deleteBtn: { fontSize: 14, fontWeight: '600', marginLeft: 8 },
});