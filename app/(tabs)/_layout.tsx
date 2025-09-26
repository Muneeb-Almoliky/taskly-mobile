import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color }) => (
            <Ionicons name="checkmark-circle" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="person-circle" color={color} />,
        }}
      />
      <Tabs.Screen
      name="archived"
      options={{
        title: 'Archived',
        tabBarIcon: ({ color }) => <Ionicons size={28} name="archive" color={color} />,
      }}
    />
      <Tabs.Screen
      name="add-task"
      options={{
        title: 'Add Task',
        tabBarIcon: ({ color }) => <Ionicons size={28} name="add-circle" color={color} />,
      }}
    />
    </Tabs>
    
  );
}
