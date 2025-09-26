import { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  Animated,
  Easing,
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeColor } from '@/hooks/use-theme-color';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { CreateTaskData } from '@/constants/types';
import { createTask } from '@/services/taskService';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width } = Dimensions.get('window');

export default function AddTask() {
  const [taskTitle, setTaskTitle] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [isImportant, setIsImportant] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(headerScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(headerScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start();
  };

  const handleAddTask = async () => {
    if (!taskTitle.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    setIsLoading(true);
    animateButton();

    try {
      const currentDate = new Date().toISOString();
      const taskData: CreateTaskData = { 
        title: taskTitle.trim(), 
        date: currentDate, 
        completionStatus: false, 
        starredStatus: isImportant,
        dueDate: dueDate,
      };
      
      await createTask(taskData);
      
      Alert.alert('Success', 'Task added successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
      
      setTaskTitle('');
      setIsImportant(false);
      setDueDate(null);
      
    } catch (error) {
      console.error('Error creating task:', error);
      Alert.alert('Error', 'Failed to create task');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header with Gradient - Cleaner version for Add Task */}
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
            <View style={styles.headerCenter}>
              <Text style={styles.appTitle}>Taskly</Text>
              <Text style={styles.headerSubtitle}>Create New Task</Text>
            </View>
            <View style={styles.placeholder} />
          </View>
          
          {/* Feature Icons instead of stats */}
          <Animated.View 
            style={[
              styles.featuresContainer, 
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
          >
            <View style={styles.featureItem}>
              <Ionicons name="create-outline" size={20} color="#fff" />
              <Text style={styles.featureText}>Quick Create</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="flash-outline" size={20} color="#fff" />
              <Text style={styles.featureText}>Easy Setup</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="options-outline" size={20} color="#fff" />
              <Text style={styles.featureText}>Flexible Options</Text>
            </View>
          </Animated.View>
        </LinearGradient>
      </Animated.View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View 
          style={[
            styles.formContainer,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
          onLayout={animateHeader}
        >
          <View style={styles.welcomeSection}>
            <Text style={[styles.welcomeTitle, { color: textColor }]}>
              What's on your mind?
            </Text>
            <Text style={[styles.welcomeSubtitle, { color: textColor }]}>
              Add a task to get started with your productivity journey
            </Text>
          </View>

          {/* Task Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: textColor }]}>Task Title</Text>
            <TextInput
              style={[styles.taskInput, { backgroundColor: cardColor, color: textColor, borderColor }]}
              placeholder="What needs to be done?"
              placeholderTextColor="#9CA3AF"
              value={taskTitle}
              onChangeText={setTaskTitle}
              multiline={true}
              numberOfLines={3}
              textAlignVertical="top"
              autoFocus={true}
            />
          </View>

          {/* Options */}
          <View style={styles.optionsContainer}>
            <Text style={[styles.optionsTitle, { color: textColor }]}>Task Options</Text>
            
            {/* Important Toggle */}
            <TouchableOpacity 
              style={[styles.optionItem, { backgroundColor: cardColor, borderColor }]}
              onPress={() => setIsImportant(!isImportant)}
            >
              <View style={styles.optionLeft}>
                <Ionicons 
                  name={isImportant ? "star" : "star-outline"} 
                  size={24} 
                  color={isImportant ? tintColor : textColor} 
                />
                <Text style={[styles.optionText, { color: textColor }]}>Mark as Important</Text>
              </View>
              <View style={[
                styles.toggle, 
                isImportant && { backgroundColor: tintColor }
              ]}>
                <View style={[
                  styles.toggleKnob, 
                  isImportant && styles.toggleKnobActive
                ]} />
              </View>
            </TouchableOpacity>

            {/* Due Date Picker */}
            <TouchableOpacity 
              style={[styles.optionItem, { backgroundColor: cardColor, borderColor }]}
              onPress={() => setShowDatePicker(true)}
            >
              <View style={styles.optionLeft}>
                <Ionicons name="calendar-outline" size={24} color={textColor} />
                <Text style={[styles.optionText, { color: textColor }]}>
                  {dueDate ? `Due: ${formatDate(dueDate)}` : 'Set Due Date'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={textColor} />
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={dueDate || new Date()}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}
          </View>

          {/* Add Button */}
          <Animated.View style={{ transform: [{ scale: headerScale }] }}>
            <TouchableOpacity 
              style={[styles.addButton, { backgroundColor: tintColor }]}
              onPress={handleAddTask}
              disabled={isLoading}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <Ionicons name="ellipsis-horizontal" size={20} color="#fff" />
                  <Text style={styles.addButtonText}>Creating Task...</Text>
                </View>
              ) : (
                <View style={styles.buttonContent}>
                  <Ionicons name="add-circle" size={22} color="#fff" />
                  <Text style={styles.addButtonText}>Add Task</Text>
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <Text style={[styles.quickActionsTitle, { color: textColor }]}>Quick Templates</Text>
            <Text style={[styles.quickActionsSubtitle, { color: textColor }]}>
              Tap to quickly fill common task types
            </Text>
            <View style={styles.quickActionsGrid}>
              <TouchableOpacity 
                style={[styles.quickAction, { backgroundColor: cardColor, borderColor }]}
                onPress={() => {
                  setTaskTitle('Review project documents and provide feedback');
                  setIsImportant(true);
                }}
              >
                <Ionicons name="document-text" size={20} color={tintColor} />
                <Text style={[styles.quickActionText, { color: textColor }]}>Review</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.quickAction, { backgroundColor: cardColor, borderColor }]}
                onPress={() => {
                  setTaskTitle('Call client for project update discussion');
                  setIsImportant(false);
                }}
              >
                <Ionicons name="call" size={20} color={tintColor} />
                <Text style={[styles.quickActionText, { color: textColor }]}>Call</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.quickAction, { backgroundColor: cardColor, borderColor }]}
                onPress={() => {
                  setTaskTitle('Email team with weekly status report');
                  setIsImportant(false);
                }}
              >
                <Ionicons name="mail" size={20} color={tintColor} />
                <Text style={[styles.quickActionText, { color: textColor }]}>Email</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.quickAction, { backgroundColor: cardColor, borderColor }]}
                onPress={() => {
                  setTaskTitle('Prepare agenda and materials for team meeting');
                  setIsImportant(true);
                }}
              >
                <Ionicons name="people" size={20} color={tintColor} />
                <Text style={[styles.quickActionText, { color: textColor }]}>Meeting</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    paddingBottom: 25,
    paddingHorizontal: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  placeholder: {
    width: 40,
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
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  featureItem: {
    alignItems: 'center',
  },
  featureText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  formContainer: {
    flex: 1,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  taskInput: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  optionsContainer: {
    marginBottom: 32,
  },
  optionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    marginLeft: 12,
    fontSize: 16,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
    padding: 2,
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
    transform: [{ translateX: 0 }],
  },
  toggleKnobActive: {
    transform: [{ translateX: 22 }],
  },
  addButton: {
    padding: 18,
    borderRadius: 12,
    marginBottom: 32,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  quickActions: {
    marginBottom: 20,
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  quickActionsSubtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAction: {
    width: (width - 60) / 2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  quickActionText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
  },
});