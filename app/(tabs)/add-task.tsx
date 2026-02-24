import Header from '@/components/Header';
import { CreateTaskData } from '@/constants/types';
import { useThemeColor } from '@/hooks/use-theme-color';
import { createTask } from '@/services/taskService';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    Easing,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

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
      {/* Universal Header */}
      <Header
        title="New Task"
        subtitle="Create New Task"
        showBackButton={false}
      />


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
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  taskInput: {
    borderRadius: 8,
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
    borderRadius: 8,
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
    padding: 16,
    borderRadius: 8,
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
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  quickActionText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
  },
});