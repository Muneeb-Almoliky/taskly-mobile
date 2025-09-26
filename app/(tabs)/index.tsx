

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
  TextInput,
  RefreshControl
} from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeColor } from '@/hooks/use-theme-color';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import TaskList from '@/components/task-list';
import { CreateTaskData, Task, TaskStatus } from '@/constants/types';
import { 
  getTasks, 
  createTask, 
  updateTask, 
  deleteTask, 
  toggleTaskCompletion, 
  toggleTaskStar,
  toggleArchiveTask 
} from '@/services/taskService';

const { width } = Dimensions.get('window');

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState(TaskStatus.ALL);
  const [newTaskText, setNewTaskText] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const router = useRouter();
  
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const addButtonRotate = useRef(new Animated.Value(0)).current;
  const taskInputHeight = useRef(new Animated.Value(0)).current;
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

  const handleAddTask = async () => {
    if (!newTaskText.trim()) return;
    
    try {
      const currentDate = new Date().toISOString();
      const data: CreateTaskData = { title: newTaskText.trim(), date: currentDate, completionStatus: false, starredStatus: false };
      const newTask = await createTask(data);
      loadTasks();
      setNewTaskText('');
      toggleAddTask();
      
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
      console.error('Error creating task:', error);
      Alert.alert('Error', 'Failed to create task');
    }
  };

  const handleToggleTask = async (taskId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      const updatedTask = await toggleTaskCompletion(taskId, !task?.completion_status);
      loadTasks();
    } catch (error) {
      console.error('Error toggling task:', error);
      Alert.alert('Error', 'Failed to update task');
    }
  };

  const handleToggleStar = async (taskId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      const updatedTask = await toggleTaskStar(taskId, !task?.starred_status);
      loadTasks();
    } catch (error) {
      console.error('Error toggling star:', error);
      Alert.alert('Error', 'Failed to update task');
    }
  };

  const handleToggleArchive = async (taskId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      const updatedTask = await toggleArchiveTask(taskId, !task?.archived_status);
      loadTasks();
    } catch (error) {
      console.error('Error toggling archive:', error);
      Alert.alert('Error', 'Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    // First animate the task removal
    setTasks(tasks.filter(t => t.id !== taskId));
    
    try {
      await deleteTask(taskId);
    } catch (error) {
      console.error('Error deleting task:', error);
      Alert.alert('Error', 'Failed to delete task');
      // Reload tasks if deletion failed
      loadTasks();
    }
  };

  const handleEditTask = async (taskId: string, newTitle: string) => {
    try {
      // Update local state immediately for better UX
      setTasks(tasks.map(t => 
        t.id === taskId ? { ...t, title: newTitle } : t
      ));
      
      // Then call the API
      await updateTask(taskId, newTitle);
      
      // Optional: reload to ensure sync with server
      // loadTasks();
    } catch (error) {
      console.error('Error editing task:', error);
      Alert.alert('Error', 'Failed to update task');
      // Revert local state if API call fails
      loadTasks();
    }
  };

  const toggleAddTask = () => {
    if (isAddingTask) {
      Animated.parallel([
        Animated.timing(taskInputHeight, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(addButtonRotate, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => setIsAddingTask(false));
    } else {
      setIsAddingTask(true);
      Animated.parallel([
        Animated.timing(taskInputHeight, {
          toValue: 80,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(addButtonRotate, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (activeFilter === TaskStatus.ACTIVE) return !task.completion_status && !task.archived_status;
    if (activeFilter === TaskStatus.COMPLETED) return task.completion_status && !task.archived_status;
    if (activeFilter === TaskStatus.ARCHIVED) return task.archived_status;
    if (activeFilter === TaskStatus.STARRED) return task.starred_status && !task.archived_status;
    return !task.archived_status;
  });

  const stats = {
    total: tasks.filter(t => !t.archived_status).length,
    completed: tasks.filter(t => t.completion_status && !t.archived_status).length,
    starred: tasks.filter(t => t.starred_status && !t.archived_status).length,
    archived: tasks.filter(t => t.archived_status).length,
  };

  const completionPercentage = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

  const addButtonInterpolate = addButtonRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '135deg'],
  });

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
          <Text style={styles.headerSubtitle}>Loading your tasks...</Text>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <Animated.View style={styles.loadingSpinner}>
            <Ionicons name="refresh-circle" size={60} color={tintColor} />
          </Animated.View>
          <Text style={[styles.loadingText, { color: textColor }]}>Getting things ready</Text>
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
            <View>
              <Text style={styles.appTitle}>Taskly</Text>
              <Text style={styles.headerSubtitle}>Your productivity companion</Text>
            </View>
            <TouchableOpacity 
            //   onPress={() => router.push('/profile')} 
              style={styles.profileButton}
            >
              <Ionicons name="person" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
          
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressBackground, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${completionPercentage}%`,
                    backgroundColor: '#fff'
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round(completionPercentage)}% Complete
            </Text>
          </View>

          {/* Stats Cards */}
          <Animated.View 
            style={[
              styles.statsContainer, 
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
          >
            <View style={[styles.statCard, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
              <Text style={styles.statNumber}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
              <Text style={styles.statNumber}>{stats.completed}</Text>
              <Text style={styles.statLabel}>Done</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
              <Text style={styles.statNumber}>{stats.starred}</Text>
              <Text style={styles.statLabel}>Starred</Text>
            </View>
          </Animated.View>
        </LinearGradient>
      </Animated.View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Filter Chips */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
        >
          {[TaskStatus.ALL, TaskStatus.ACTIVE, TaskStatus.COMPLETED, TaskStatus.STARRED, TaskStatus.ARCHIVED].map(filter => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterChip,
                { backgroundColor: cardColor, borderColor },
                activeFilter === filter && { backgroundColor: tintColor }
              ]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text style={[
                styles.filterText,
                { color: textColor },
                activeFilter === filter && styles.activeFilterText
              ]}>
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

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
            tasks={filteredTasks}
            onToggleTask={handleToggleTask}
            onToggleStar={handleToggleStar}
            onToggleArchive={handleToggleArchive}
            onDeleteTask={handleDeleteTask}
            onEditTask={handleEditTask}
          />
        </ScrollView>

        {/* Add Task Input */}
        <Animated.View style={[styles.addTaskContainer, { height: taskInputHeight }]}>
          <TextInput
            style={[styles.taskInput, { backgroundColor: cardColor, color: textColor, borderColor }]}
            placeholder="What needs to be done?"
            placeholderTextColor="#9CA3AF"
            value={newTaskText}
            onChangeText={setNewTaskText}
            onSubmitEditing={handleAddTask}
          />
        </Animated.View>

        {/* Add Task Button */}
        <View style={styles.addButtonContainer}>
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: tintColor }]}
            onPress={() => router.push('/add-task')} // navigate to Add Task Screen
          >
            <Ionicons name="add" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

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
  appTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  progressContainer: {
    marginBottom: 25,
  },
  progressBackground: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
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
  },
  filterContainer: {
    marginTop: 20,
    marginBottom: 15,
    maxHeight: 40,
  },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  filterText: {
    fontWeight: '600',
    fontSize: 14,
  },
  activeFilterText: {
    color: 'white',
  },
  taskListContainer: {
    flex: 1,
  },
  addTaskContainer: {
    overflow: 'hidden',
    marginTop: 15,
    marginBottom: 10,
  },
  taskInput: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 20,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  addButtonContainer: {
    position: 'absolute',
    right: 20,
    bottom: 25,
    zIndex: 20,
  },
  addButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
});