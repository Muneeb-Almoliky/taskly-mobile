import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import TaskList from '@/components/task-list';
import { TaskStatus } from '@/constants/types';
import { useTaskContext } from '@/context/TaskContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getEmail } from '@/services/authService';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
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

export default function Tasks() {
  const { 
    tasks, 
    loading, 
    refreshing, 
    onRefresh, 
    handleToggleTask, 
    handleToggleStar, 
    handleToggleArchive, 
    handleDeleteTask, 
    handleEditTask 
  } = useTaskContext();
  
  const [activeFilter, setActiveFilter] = useState(TaskStatus.ALL);
  const [searchQuery, setSearchQuery] = useState('');
  const [userName, setUserName] = useState('');
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
    loadUserInfo();
    animateHeader();
  }, []);

  const loadUserInfo = async () => {
    try {
      const email = await getEmail();
      if (email) {
        const nameFromEmail = email.split('@')[0];
        const formattedName = nameFromEmail
          .split('.')
          .map((s: string) => s.charAt(0).toUpperCase() + s.slice(1))
          .join(' ');
        setUserName(formattedName);
      }
    } catch (error) {
      console.error('Error loading user info:', error);
    }
  };

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

  const filteredTasks = tasks.filter(task => {
    // 1. Check Search Query
    if (searchQuery.trim() !== '') {
      if (!task.title.toLowerCase().includes(searchQuery.toLowerCase().trim())) {
        return false;
      }
    }

    // 2. Check Status Filters
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

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <Header title="Taskly" subtitle="Loading your tasks..." />
        <View style={styles.loadingContainer}>
          <Ionicons name="hourglass-outline" size={40} color={tintColor} />
          <Text style={[styles.loadingText, { color: textColor }]}>Getting things ready</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Universal Header */}
      <Header
        title="Tasks"
        subtitle={`Let's get things done, ${userName}`}
      />

      {/* Global Search */}
      <View style={styles.searchContainer}>
        <SearchBar 
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBackground, { backgroundColor, borderColor, borderWidth: 1 }]}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${completionPercentage}%`,
                backgroundColor: tintColor
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
        <View style={[styles.statCard, { backgroundColor, borderColor, borderWidth: 1 }]}>
          <Text style={[styles.statNumber, { color: textColor }]}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor, borderColor, borderWidth: 1 }]}>
          <Text style={[styles.statNumber, { color: textColor }]}>{stats.completed}</Text>
          <Text style={styles.statLabel}>Done</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor, borderColor, borderWidth: 1 }]}>
          <Text style={[styles.statNumber, { color: textColor }]}>{stats.starred}</Text>
          <Text style={styles.statLabel}>Starred</Text>
        </View>
      </Animated.View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Filter Chips */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
        >
          {[TaskStatus.ALL, TaskStatus.ACTIVE, TaskStatus.COMPLETED, TaskStatus.STARRED].map(filter => (
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
            searchQuery={searchQuery}
            onToggleTask={handleToggleTask}
            onToggleStar={handleToggleStar}
            onToggleArchive={handleToggleArchive}
            onDeleteTask={handleDeleteTask}
            onEditTask={handleEditTask}
          />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 4,
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 16,
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
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
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
  },
  filterContainer: {
    marginTop: 20,
    marginBottom: 15,
    maxHeight: 40,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    marginRight: 8,
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
});