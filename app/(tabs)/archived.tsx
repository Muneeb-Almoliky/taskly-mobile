import { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  Animated,
  Easing,
  Dimensions,
  RefreshControl
} from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeColor } from '@/hooks/use-theme-color';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import TaskList from '@/components/task-list';
import { Task, TaskStatus } from '@/constants/types';
import { 
  getTasks, 
  deleteTask, 
  toggleArchiveTask 
} from '@/services/taskService';

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
        <LinearGradient
          colors={[tintColor, '#7C3AED']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.appTitle}>Taskly</Text>
          <Text style={styles.headerSubtitle}>Loading your archive...</Text>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <Animated.View style={styles.loadingSpinner}>
            <Ionicons name="archive" size={60} color={tintColor} />
          </Animated.View>
          <Text style={[styles.loadingText, { color: textColor }]}>Opening the archive</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Header with Gradient */}
      <Animated.View 
        style={[
          styles.headerWrapper,
          { transform: [{ scale: headerScale }] }
        ]}
      >
        <LinearGradient
          colors={[tintColor, '#7C3AED']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View>
              <Text style={styles.appTitle}>Taskly</Text>
              <Text style={styles.headerSubtitle}>Your Archived Tasks</Text>
            </View>
            <TouchableOpacity 
              onPress={handleEmptyArchive}
              style={styles.emptyButton}
              disabled={archivedTasks.length === 0}
            >
              <Ionicons name="trash-outline" size={22} color={archivedTasks.length === 0 ? 'rgba(255,255,255,0.5)' : '#fff'} />
            </TouchableOpacity>
          </View>
          
          {/* Stats Cards */}
          <Animated.View 
            style={[
              styles.statsContainer, 
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
          >
            <View style={[styles.statCard, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
              <Text style={styles.statNumber}>{archivedTasks.length}</Text>
              <Text style={styles.statLabel}>Archived</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
              <Text style={styles.statNumber}>{tasks.filter(t => t.completion_status).length}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
              <Text style={styles.statNumber}>{tasks.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </Animated.View>
        </LinearGradient>
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

            {/* Quick Actions */}
            <Animated.View 
              style={[
                styles.quickActions,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
              ]}
            >
              <Text style={[styles.quickActionsTitle, { color: textColor }]}>Quick Actions</Text>
              <View style={styles.quickActionsRow}>
                <TouchableOpacity 
                  style={[styles.quickActionButton, { backgroundColor: cardColor, borderColor }]}
                  onPress={() => router.push('/')}
                >
                  <Ionicons name="list" size={20} color={tintColor} />
                  <Text style={[styles.quickActionText, { color: textColor }]}>Active Tasks</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.quickActionButton, { backgroundColor: cardColor, borderColor }]}
                  onPress={handleEmptyArchive}
                >
                  <Ionicons name="trash" size={20} color="#FF3B30" />
                  <Text style={[styles.quickActionText, { color: textColor }]}>Clear All</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
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
  headerWrapper: {
    zIndex: 10,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  emptyButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  appTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    marginHorizontal: 6,
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
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
    paddingBottom: 100,
  },
  loadingSpinner: {
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    opacity: 0.7,
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
    borderRadius: 25,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  quickActions: {
    marginTop: 20,
    marginBottom: 20,
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 6,
  },
  quickActionText: {
    marginLeft: 8,
    fontWeight: '500',
  },
});