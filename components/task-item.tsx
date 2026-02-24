import { Task } from '@/constants/types';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    PanResponder,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');
const SWIPE_THRESHOLD = 100;

interface TaskItemProps {
  task: Task;
  index: number;
  isEditing: boolean;
  editingText: string;
  editingDueDate: Date | null;
  onEditTextChange: (text: string) => void;
  onEditDueDateChange: (date: Date | null) => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onToggleTask: (taskId: string) => void;
  onToggleStar: (taskId: string) => void;
  onToggleArchive: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  tintColor: string;
  textColor: string;
  cardColor: string;
  borderColor: string;
}

export default function TaskItem({
  task,
  index,
  isEditing,
  editingText,
  editingDueDate,
  onEditTextChange,
  onEditDueDateChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onToggleTask,
  onToggleStar,
  onToggleArchive,
  onDeleteTask,
  tintColor,
  textColor,
  cardColor,
  borderColor
}: TaskItemProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const swipeAnim = useRef(new Animated.Value(0)).current;
  const checkScale = useRef(new Animated.Value(1)).current;
  const starScale = useRef(new Animated.Value(1)).current;
  const archiveScale = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isEditing,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          swipeAnim.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -SWIPE_THRESHOLD) {
          // Swipe left enough to confirm delete
          Animated.timing(swipeAnim, {
            toValue: -width,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            onDeleteTask(task.id);
          });
        } else {
          // Return to original position
          Animated.spring(swipeAnim, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay: index * 100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const animateCheck = () => {
    Animated.sequence([
      Animated.timing(checkScale, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(checkScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateStar = () => {
    Animated.sequence([
      Animated.timing(starScale, {
        toValue: 1.15,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(starScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateArchive = () => {
    Animated.sequence([
      Animated.timing(archiveScale, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(archiveScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleToggleTask = () => {
    animateCheck();
    setTimeout(() => onToggleTask(task.id), 150);
  };

  const handleToggleStar = () => {
    animateStar();
    setTimeout(() => onToggleStar(task.id), 150);
  };

  const handleToggleArchive = () => {
    animateArchive();
    setTimeout(() => onToggleArchive(task.id), 150);
  };

  // Dimmed color for archived items
  const getDimmedColor = (originalColor: string) => {
    if (!task.archived_status) return originalColor;
    
    // Convert hex to RGB and reduce brightness
    if (originalColor.startsWith('#')) {
      const hex = originalColor.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      
      // Reduce brightness by 40%
      const dimmedR = Math.floor(r * 0.6);
      const dimmedG = Math.floor(g * 0.6);
      const dimmedB = Math.floor(b * 0.6);
      
      return `#${dimmedR.toString(16).padStart(2, '0')}${dimmedG.toString(16).padStart(2, '0')}${dimmedB.toString(16).padStart(2, '0')}`;
    }
    
    // Fallback for non-hex colors
    return originalColor;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <Animated.View
      style={[
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      {/* Delete background that appears on swipe */}
      <View style={styles.deleteBackground}>
        <Ionicons name="trash" size={24} color="#fff" />
        <Text style={styles.deleteText}>Delete</Text>
      </View>

      <Animated.View
        style={[
          styles.taskItem,
          { 
            backgroundColor: task.archived_status ? getDimmedColor(cardColor) : cardColor, 
            borderColor: task.archived_status ? getDimmedColor(borderColor) : borderColor 
          },
          {
            transform: [{ translateX: swipeAnim }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity 
          onPress={handleToggleTask}
          style={styles.checkboxContainer}
        >
          <Animated.View
            style={[
              styles.checkbox,
              { 
                backgroundColor: task.completion_status ? getDimmedColor(tintColor) : 'transparent',
                borderColor: getDimmedColor(tintColor)
              },
              { transform: [{ scale: checkScale }] }
            ]}
          >
            {task.completion_status && (
              <Ionicons name="checkmark" size={16} color={task.archived_status ? getDimmedColor('#fff') : '#fff'} />
            )}
          </Animated.View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.taskContent}
          onPress={() => !isEditing && onStartEdit()}
          onLongPress={onStartEdit}
          delayLongPress={300}
        >
          {isEditing ? (
            <View style={styles.editContainer}>
              {/* Title Edit Row */}
              <View style={styles.editTitleRow}>
                <TextInput
                  style={[styles.editInput, { color: getDimmedColor(textColor), borderBottomColor: getDimmedColor(tintColor) }]}
                  value={editingText}
                  onChangeText={onEditTextChange}
                  autoFocus
                  onSubmitEditing={onSaveEdit}
                  placeholder="Task title"
                  placeholderTextColor="#9CA3AF"
                />
                <View style={styles.editInlineButtons}>
                  <TouchableOpacity onPress={onCancelEdit} style={styles.editIconButton}>
                    <Ionicons name="close" size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={onSaveEdit} style={[styles.editIconButton, { backgroundColor: getDimmedColor(tintColor) }]}>
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Due Date Pill Row */}
              <View style={styles.editDateRow}>
                <TouchableOpacity 
                  style={[styles.dueDatePill, { 
                    borderColor: editingDueDate ? getDimmedColor(tintColor) : getDimmedColor(borderColor),
                    backgroundColor: editingDueDate ? getDimmedColor(tintColor) + '15' : 'transparent'
                  }]}
                  onPress={() => {
                    if (!editingDueDate) {
                      onEditDueDateChange(new Date());
                    }
                    setShowDatePicker(true);
                  }}
                >
                  <Ionicons 
                    name={editingDueDate ? 'calendar' : 'calendar-outline'} 
                    size={14} 
                    color={editingDueDate ? getDimmedColor(tintColor) : '#9CA3AF'} 
                  />
                  <Text style={[styles.dueDatePillText, { color: editingDueDate ? getDimmedColor(tintColor) : '#9CA3AF' }]}>
                    {editingDueDate 
                      ? editingDueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      : 'Due Date'
                    }
                  </Text>
                  {editingDueDate && (
                    <TouchableOpacity 
                      onPress={(e) => {
                        e.stopPropagation();
                        onEditDueDateChange(null);
                        setShowDatePicker(false);
                      }} 
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={{ marginLeft: 4 }}
                    >
                      <Ionicons name="close-circle" size={14} color={getDimmedColor(tintColor)} />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>

                {showDatePicker && (
                  <DateTimePicker
                    value={editingDueDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      if (event.type === 'set' && selectedDate) {
                        onEditDueDateChange(selectedDate);
                      }
                      // Close the picker on selection or dismissal (Android behavior)
                      if (Platform.OS !== 'ios') {
                        setShowDatePicker(false);
                      }
                    }}
                  />
                )}
                {/* On iOS, the inline picker stays open, so we add a done button */}
                {showDatePicker && Platform.OS === 'ios' && (
                  <TouchableOpacity 
                    onPress={() => setShowDatePicker(false)}
                    style={{ marginLeft: 8, justifyContent: 'center' }}
                  >
                    <Text style={{ color: tintColor, fontWeight: '600' }}>Done</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ) : (
            <>
              <Text 
                style={[
                  styles.taskTitle,
                  { 
                    color: getDimmedColor(textColor), 
                    textDecorationLine: task.completion_status ? 'line-through' : 'none',
                  }
                ]}
                numberOfLines={2}
              >
                {task.title}
              </Text>
              {task.due_date ? (
                <View style={styles.dueDateBadge}>
                  <Ionicons name="calendar-outline" size={12} color={getDimmedColor(tintColor)} />
                  <Text style={[styles.dueDateBadgeText, { color: getDimmedColor(tintColor) }]}>
                    Due {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </Text>
                </View>
              ) : (
                <Text style={[styles.taskDate, { color: getDimmedColor(textColor) }]}>
                  {formatDate(task.date)}
                </Text>
              )}
            </>
          )}
        </TouchableOpacity>
        
        {!isEditing && (
          <View style={styles.taskActions}>
            <TouchableOpacity 
              onPress={handleToggleStar}
              style={styles.starButton}
            >
              <Animated.View style={{ transform: [{ scale: starScale }] }}>
                <Ionicons 
                  name={task.starred_status ? "star" : "star-outline"} 
                  size={22} 
                  color={task.starred_status ? getDimmedColor("#F59E0B") : getDimmedColor(textColor)} 
                />
              </Animated.View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={handleToggleArchive}
              style={styles.archiveButton}
            >
              <Animated.View style={{ transform: [{ scale: archiveScale }] }}>
                <Ionicons 
                  name={task.archived_status ? "archive" : "archive-outline"} 
                  size={20} 
                  color={task.archived_status ? getDimmedColor("#8B5CF6") : getDimmedColor(textColor)} 
                />
              </Animated.View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => onDeleteTask(task.id)}
              style={styles.deleteButton}
            >
              <Ionicons name="trash-outline" size={20} color={getDimmedColor("#ef4444")} />
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  checkboxContainer: {
    marginRight: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  taskDate: {
    fontSize: 12,
  },
  taskActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  starButton: {
    padding: 8,
  },
  archiveButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  deleteBackground: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '100%',
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 20,
    borderRadius: 8,
    flexDirection: 'row',
  },
  deleteText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  editContainer: {
    flexDirection: 'column',
    width: '100%',
    paddingVertical: 2,
  },
  editTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 8,
  },
  editInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
    borderBottomWidth: 1.5,
  },
  editInlineButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  editIconButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  editDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  dueDatePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderRadius: 20,
    gap: 6,
  },
  dueDatePillText: {
    fontSize: 12,
    fontWeight: '500',
  },
  dateInlineInput: {
    fontSize: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderRadius: 20,
    minWidth: 90,
    textAlign: 'center',
  },
  dueDateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  dueDateBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
});