import { Task } from '@/constants/types';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import TaskItem from './task-item';

interface TaskListProps {
  tasks: Task[];
  onToggleTask: (taskId: string) => void;
  onToggleStar: (taskId: string) => void;
  onToggleArchive: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask?: (taskId: string, newTitle: string, dueDate?: Date | null) => Promise<void>;
}

export default function TaskList({ 
  tasks, 
  onToggleTask, 
  onToggleStar, 
  onToggleArchive,
  onDeleteTask, 
  onEditTask 
}: TaskListProps) {
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>('');
  const [editingDueDate, setEditingDueDate] = useState<Date | null>(null);

  const startEdit = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingText(task.title);
    setEditingDueDate(task.due_date ? new Date(task.due_date) : null);
  };

  const saveEdit = async (taskId: string) => {
    if (editingText.trim()) {
      try {
        await onEditTask!(taskId, editingText, editingDueDate);
        console.log("Edit successful");
      } catch (error) {
        console.error("Edit failed:", error);
        Alert.alert("Error", "Failed to update task");
      }
    }
    setEditingTaskId(null);
    setEditingText('');
    setEditingDueDate(null);
  };

  const cancelEdit = () => {
    setEditingTaskId(null);
    setEditingText('');
    setEditingDueDate(null);
  };

  if (tasks.length === 0) {
    return (
      <View style={styles.emptyState}>
        <View style={[styles.emptyGradient, { backgroundColor: cardColor, borderColor: borderColor, borderWidth: 1 }]}>
          <Ionicons name="checkmark-done-circle" size={48} color={tintColor} />
          <Text style={[styles.emptyText, { color: textColor }]}>
            No tasks yet. Add your first task to get started!
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.taskList}>
      {tasks.map((task, index) => (
        <TaskItem
          key={task.id}
          task={task}
          index={index}
          isEditing={editingTaskId === task.id}
          editingText={editingText}
          editingDueDate={editingDueDate}
          onEditTextChange={setEditingText}
          onEditDueDateChange={setEditingDueDate}
          onStartEdit={() => startEdit(task)}
          onSaveEdit={() => saveEdit(task.id)}
          onCancelEdit={cancelEdit}
          onToggleTask={onToggleTask}
          onToggleStar={onToggleStar}
          onToggleArchive={onToggleArchive}
          onDeleteTask={onDeleteTask}
          tintColor={tintColor}
          textColor={textColor}
          cardColor={cardColor}
          borderColor={borderColor}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  taskList: {
    gap: 12,
    paddingBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    borderRadius: 8,
    width: '100%',
  },
  emptyText: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 16,
    opacity: 0.7,
  },
});