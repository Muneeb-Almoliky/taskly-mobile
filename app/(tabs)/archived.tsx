import Header from '@/components/Header';
import TaskList from '@/components/task-list';
import { Task } from '@/constants/types';
import { useThemeColor } from '@/hooks/use-theme-color';
import {
    deleteTask,
    getTasks,
    toggleArchiveTask
} from '@/services/taskService';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    Easing,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

export default function Archived() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [archivedTasks, setArchivedTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const headerScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadTasks();
    animateHeader();
  }, []);

  const animateHeader = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(headerScale, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadTasks = async () => {
    try {
      const userTasks = await getTasks();
      setTasks(userTasks);
      // Filter only archived tasks
      setArchivedTasks(userTasks.filter((task: Task) => task.archived_status));
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

  const handleUnarchiveTask = async (taskId: string) => {
    try {
      const updatedTask = await toggleArchiveTask(taskId, false);
      loadTasks();
      
      // Success animation
      Animated.sequence([
        Animated.timing(headerScale, {
          toValue: 1.05,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(headerScale, {
          toValue: 1,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } catch (error) {
      console.error('Error unarchiving task:', error);
      Alert.alert('Error', 'Failed to unarchive task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    // First animate the task removal
    setArchivedTasks(archivedTasks.filter(t => t.id !== taskId));
    
    try {
      await deleteTask(taskId);
    } catch (error) {
      console.error('Error deleting task:', error);
      Alert.alert('Error', 'Failed to delete task');
      // Reload tasks if deletion failed
      loadTasks();
    }
  };

  const handleEmptyArchive = () => {
    Alert.alert(
      'Empty Archive',
      'Are you sure you want to delete all archived tasks?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete All', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete all archived tasks
              const deletePromises = archivedTasks.map(task => deleteTask(task.id));
              await Promise.all(deletePromises);
              setArchivedTasks([]);
            } catch (error) {
              console.error('Error deleting all tasks:', error);
              Alert.alert('Error', 'Failed to delete all tasks');
              loadTasks();
            }
          }
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <Header title="Taskly" subtitle="Loading your archive..." />
        <View style={styles.loadingContainer}>
          <Ionicons name="archive-outline" size={40} color={tintColor} />
          <Text style={[styles.loadingText, { color: textColor }]}>Opening the archive</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Universal Header */}
      <Header
        title="Archived"
        subtitle="Your Archived Tasks"
        showBackButton={false}
        rightElement={
          <TouchableOpacity 
            onPress={handleEmptyArchive}
            style={[styles.emptyButton, { backgroundColor, borderColor, borderWidth: 1 }]}
            disabled={archivedTasks.length === 0}
          >
            <Ionicons name="trash-outline" size={22} color={archivedTasks.length === 0 ? 'rgba(255,100,100,0.5)' : '#ef4444'} />
          </TouchableOpacity>
        }
      />

      {/* Stats Cards */}
      <Animated.View 
        style={[
          styles.statsContainer, 
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}
      >
        <View style={[styles.statCard, { backgroundColor, borderColor, borderWidth: 1 }]}>
          <Text style={[styles.statNumber, { color: textColor }]}>{archivedTasks.length}</Text>
          <Text style={styles.statLabel}>Archived</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor, borderColor, borderWidth: 1 }]}>
          <Text style={[styles.statNumber, { color: textColor }]}>{tasks.filter(t => t.completion_status).length}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor, borderColor, borderWidth: 1 }]}>
          <Text style={[styles.statNumber, { color: textColor }]}>{tasks.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </Animated.View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Empty State */}
        {archivedTasks.length === 0 ? (
          <Animated.View 
            style={[
              styles.emptyState,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
          >
            <Ionicons name="archive-outline" size={64} color={textColor} style={{ opacity: 0.5 }} />
            <Text style={[styles.emptyStateTitle, { color: textColor }]}>No Archived Tasks</Text>
            <Text style={[styles.emptyStateSubtitle, { color: textColor }]}>
              Tasks you archive will appear here
            </Text>
            <TouchableOpacity 
              style={[styles.primaryButton, { backgroundColor: tintColor }]}
              onPress={() => router.push('/')}
            >
              <Text style={styles.primaryButtonText}>View Active Tasks</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <>
            {/* Tasks List */}
            <ScrollView 
              style={styles.taskListContainer}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[tintColor]}
                  tintColor={tintColor}
                />
              }
            >
              <TaskList
                tasks={archivedTasks}
                onToggleArchive={handleUnarchiveTask}
                onDeleteTask={handleDeleteTask}
                onToggleStar={() => {}}
                onToggleTask={() => {}}
              />
            </ScrollView>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyButton: {
    padding: 8,
    borderRadius: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 4,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  taskListContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingBottom: 100,
  },
  loadingText: {
    fontSize: 15,
    opacity: 0.5,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 24,
    textAlign: 'center',
  },
  primaryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});