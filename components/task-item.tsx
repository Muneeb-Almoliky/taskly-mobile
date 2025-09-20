import { Task } from '@/constants/types';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  PanResponder,
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
  onEditTextChange: (text: string) => void;
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
  onEditTextChange,
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
        toValue: 1.2,
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
        toValue: 1.3,
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
        toValue: 1.2,
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
          { backgroundColor: cardColor, borderColor },
          task.archived_status && styles.archivedTask,
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
                backgroundColor: task.completion_status ? tintColor : 'transparent',
                borderColor: tintColor
              },
              { transform: [{ scale: checkScale }] }
            ]}
          >
            {task.completion_status && (
              <Ionicons name="checkmark" size={16} color="#fff" />
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
              <TextInput
                style={[styles.editInput, { color: textColor }]}
                value={editingText}
                onChangeText={onEditTextChange}
                autoFocus
                onSubmitEditing={onSaveEdit}
                onBlur={onCancelEdit}
              />
              <View style={styles.editButtons}>
                <TouchableOpacity onPress={onSaveEdit} style={styles.editButton}>
                  <Ionicons name="checkmark" size={20} color={tintColor} />
                </TouchableOpacity>
                <TouchableOpacity onPress={onCancelEdit} style={styles.editButton}>
                  <Ionicons name="close" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <Text 
                style={[
                  styles.taskTitle,
                  { 
                    color: textColor,
                    textDecorationLine: task.completion_status ? 'line-through' : 'none',
                    opacity: task.completion_status ? 0.7 : 1
                  }
                ]}
                numberOfLines={2}
              >
                {task.title}
              </Text>
              <Text style={[styles.taskDate, { color: textColor, opacity: 0.6 }]}>
                {formatDate(task.date)}
              </Text>
            </>
          )}
        </TouchableOpacity>
        
        <View style={styles.taskActions}>
          <TouchableOpacity 
            onPress={handleToggleStar}
            style={styles.starButton}
          >
            <Animated.View style={{ transform: [{ scale: starScale }] }}>
              <Ionicons 
                name={task.starred_status ? "star" : "star-outline"} 
                size={22} 
                color={task.starred_status ? "#F59E0B" : textColor} 
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
                color={task.archived_status ? "#8B5CF6" : textColor} 
              />
            </Animated.View>
          </TouchableOpacity>
          
          {!isEditing && (
            <TouchableOpacity 
              onPress={() => onDeleteTask(task.id)}
              style={styles.deleteButton}
            >
              <Ionicons name="trash-outline" size={20} color="#ef4444" />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    </Animated.View>
  );
}


const styles = StyleSheet.create({
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  archivedTask: {
    opacity: 0.6,
  },
  checkboxContainer: {
    marginRight: 16,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
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
    borderRadius: 20,
    flexDirection: 'row',
  },
  deleteText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  editInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  editButtons: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  editButton: {
    padding: 4,
    marginLeft: 8,
  },
});