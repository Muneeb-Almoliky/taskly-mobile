import { Task } from '@/constants/types';
import {
  deleteTask as apiDeleteTask,
  toggleArchiveTask as apiToggleArchiveTask,
  toggleTaskCompletion as apiToggleTaskCompletion,
  toggleTaskStar as apiToggleTaskStar,
  updateTask as apiUpdateTask,
  getTasks,
} from '@/services/taskService';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';

interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  refreshing: boolean;
  loadTasks: () => Promise<void>;
  onRefresh: () => void;
  handleToggleTask: (taskId: string) => Promise<void>;
  handleToggleStar: (taskId: string) => Promise<void>;
  handleToggleArchive: (taskId: string) => Promise<void>;
  handleDeleteTask: (taskId: string) => Promise<void>;
  handleEditTask: (taskId: string, newTitle: string, dueDate?: Date | null) => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const userTasks = await getTasks();
      setTasks(userTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
      Alert.alert('Error', 'Failed to load tasks');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadTasks();
  };

  const handleToggleTask = async (taskId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      setTasks(tasks.map(t => t.id === taskId ? { ...t, completion_status: !t.completion_status } : t));
      await apiToggleTaskCompletion(taskId, !task?.completion_status);
      loadTasks();
    } catch (error) {
      console.error('Error toggling task:', error);
      Alert.alert('Error', 'Failed to update task');
      loadTasks(); // rollback on error
    }
  };

  const handleToggleStar = async (taskId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      setTasks(tasks.map(t => t.id === taskId ? { ...t, starred_status: !t.starred_status } : t));
      await apiToggleTaskStar(taskId, !task?.starred_status);
      loadTasks();
    } catch (error) {
      console.error('Error toggling star:', error);
      Alert.alert('Error', 'Failed to update task');
      loadTasks(); // rollback on error
    }
  };

  const handleToggleArchive = async (taskId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      setTasks(tasks.map(t => t.id === taskId ? { ...t, archived_status: !t.archived_status } : t));
      await apiToggleArchiveTask(taskId, !task?.archived_status);
      loadTasks();
    } catch (error) {
      console.error('Error toggling archive:', error);
      Alert.alert('Error', 'Failed to update task');
      loadTasks(); // rollback on error
    }
  };

  const handleEditTask = async (taskId: string, newTitle: string, dueDate?: Date | null) => {
    try {
      const formattedDate = dueDate ? `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}-${String(dueDate.getDate()).padStart(2, '0')}` : undefined;
      
      setTasks(tasks.map(t => t.id === taskId ? { ...t, title: newTitle, due_date: formattedDate } : t));
      
      await apiUpdateTask(taskId, newTitle, dueDate);
      
      loadTasks();
    } catch (error) {
      console.error('Error updating task:', error);
      Alert.alert('Error', 'Failed to update task');
      loadTasks(); // rollback on error
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      setTasks(tasks.filter(t => t.id !== taskId));
      await apiDeleteTask(taskId);
      loadTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      Alert.alert('Error', 'Failed to delete task');
      loadTasks(); // rollback on error
    }
  };

  return (
    <TaskContext.Provider value={{
      tasks, loading, refreshing, loadTasks, onRefresh,
      handleToggleTask, handleToggleStar, handleToggleArchive, handleDeleteTask, handleEditTask
    }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTaskContext() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
}
