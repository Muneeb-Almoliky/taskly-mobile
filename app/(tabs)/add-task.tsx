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
    Switch,
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
    <View style={[styles.container, { backgroundColor }]}>
      <KeyboardAvoidingView 
        style={styles.container}
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
          {/* Task Input Canvas */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.taskInput, { color: textColor }]}
              placeholder="What needs to be done?"
              placeholderTextColor="#9CA3AF"
              value={taskTitle}
              onChangeText={setTaskTitle}
              multiline={true}
              textAlignVertical="top"
              autoFocus={true}
            />
          </View>

          {/* Quick Actions (Pills) */}
          <View style={styles.quickActions}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Suggested</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickActionsScroll}>
              {[
                { label: 'Review', icon: 'document-text', important: true, text: 'Review project documents and provide feedback' },
                { label: 'Call', icon: 'call', important: false, text: 'Call client for project update discussion' },
                { label: 'Email', icon: 'mail', important: false, text: 'Email team with weekly status report' },
                { label: 'Meeting', icon: 'people', important: true, text: 'Prepare agenda and materials for team meeting' }
              ].map((template, i) => (
                <TouchableOpacity 
                  key={i}
                  style={[styles.quickActionMatch, { backgroundColor: cardColor, borderColor }]}
                  onPress={() => {
                    setTaskTitle(template.text);
                    setIsImportant(template.important);
                  }}
                >
                  <Ionicons name={template.icon as any} size={16} color={tintColor} />
                  <Text style={[styles.quickActionTextMatch, { color: textColor }]}>{template.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Options */}
          <View style={styles.optionsContainer}>
            
            {/* Due Date Picker */}
            <TouchableOpacity 
              style={[styles.optionItem, { backgroundColor: cardColor, borderColor, borderBottomWidth: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }]}
              onPress={() => setShowDatePicker(true)}
            >
              <View style={styles.optionLeft}>
                <View style={[styles.iconContainer, { backgroundColor: `${tintColor}20` }]}>
                  <Ionicons name="calendar" size={20} color={tintColor} />
                </View>
                <Text style={[styles.optionText, { color: textColor }]}>
                  {dueDate ? `Due: ${formatDate(dueDate)}` : 'Set Due Date'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            {/* Important Toggle */}
            <View 
              style={[styles.optionItem, { backgroundColor: cardColor, borderColor, borderTopLeftRadius: 0, borderTopRightRadius: 0 }]}
            >
              <View style={styles.optionLeft}>
                <View style={[styles.iconContainer, { backgroundColor: isImportant ? `${tintColor}20` : '#F3F4F6' }]}>
                  <Ionicons 
                    name="star" 
                    size={20} 
                    color={isImportant ? tintColor : '#9CA3AF'} 
                  />
                </View>
                <Text style={[styles.optionText, { color: textColor }]}>Mark as Important</Text>
              </View>
              <Switch
                value={isImportant}
                onValueChange={setIsImportant}
                trackColor={{ false: "#E5E7EB", true: tintColor }}
                thumbColor={isImportant ? "#fff" : "#fff"}
              />
            </View>

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

          {/* Picker Modal acts immediately below the options container */}
        </Animated.View>
      </ScrollView>
      </KeyboardAvoidingView>
    </View>
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
    paddingBottom: 110,
  },
  formContainer: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 16,
    paddingTop: 10,
  },
  taskInput: {
    fontSize: 26,
    fontWeight: '300',
    minHeight: 120,
    maxHeight: 250,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 4,
  },
  optionsContainer: {
    marginBottom: 32,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: {
    marginLeft: 14,
    fontSize: 16,
    fontWeight: '500',
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
    marginBottom: 32,
  },
  quickActionsScroll: {
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  quickActionMatch: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quickActionTextMatch: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
});