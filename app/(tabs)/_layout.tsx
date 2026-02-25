import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'light';
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[theme].tint,
          tabBarInactiveTintColor: theme === 'dark' ? '#8e8e93' : '#999999',
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: {
            position: 'absolute',
            bottom: insets.bottom + 5,
            left: 16,
            right: 16,
            elevation: 0,
            borderTopWidth: 0,
            backgroundColor: Platform.OS === 'ios' ? 'transparent' : (theme === 'dark' ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.85)'),
            height: 64,
            paddingBottom: 0,
            paddingTop: 0,
            borderRadius: 32,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
          },
        tabBarItemStyle: {
          paddingVertical: 0, // handeled by HapticTab now
        },
        tabBarBackground: () => (
          <BlurView 
            intensity={Platform.OS === 'ios' ? 80 : 100} 
            tint={theme === 'dark' ? 'dark' : 'light'} 
            style={StyleSheet.absoluteFill} 
          />
        ),
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 2,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "checkmark-circle" : "checkmark-circle-outline"} size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="add-task"
        options={{
          title: 'Add',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "add-circle" : "add-circle-outline"} size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="archived"
        options={{
          title: 'Archived',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "archive" : "archive-outline"} size={26} color={color} />
          ),
        }}
      />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? "person-circle" : "person-circle-outline"} size={26} color={color} />
            ),
          }}
        />
      </Tabs>

      {/* Subtle floor overlay to provide blur below the tabs */}
      <BlurView
        intensity={Platform.OS === 'ios' ? 30 : 50}
        tint={theme === 'dark' ? 'dark' : 'light'}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: insets.bottom + 15, // Blurs the safe area area below the tabs
          backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
        }}
      />
    </View>
  );
}
