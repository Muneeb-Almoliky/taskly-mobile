import { DarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { TaskProvider } from '@/context/TaskContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

const screens: Array<{ name: string; options: any }> = [
  { name: '(tabs)', options: { headerShown: false } },        
  { name: '(auth)/login', options: { title: 'Login', headerShown: false } },
  { name: '(auth)/signup', options: { title: 'Sign Up', headerShown: false } },
  { name: 'modal', options: { title: 'Modal', presentation: 'modal' } },
];

import { getEmail } from '@/services/authService';
import { useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';

// A separate component to consume the Context once mounted
function NavigationWrapper() {
  const colorScheme = useColorScheme();

  return (
    <NavThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        {screens.map((screen) => (
          <Stack.Screen key={screen.name} {...screen} />
        ))}
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </NavThemeProvider>
  );
}

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [isReady, setIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // 1. Initial Auth Check
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const email = await getEmail();
        setIsAuthenticated(!!email);
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsAuthenticated(false);
      } finally {
        setIsReady(true);
      }
    };
    checkAuthStatus();
  }, []);

  // 2. Route Protection based on Auth State & Current Segment
  useEffect(() => {
    if (!isReady) return;

    const verifyAndProtect = async () => {
      try {
        const email = await getEmail();
        const isAuth = !!email;
        setIsAuthenticated(isAuth);

        const inAuthGroup = segments[0] === '(auth)';

        if (isAuth && inAuthGroup) {
          // Logged in but trying to view login/signup -> Redirect to dashboard
          router.replace('/(tabs)');
        } else if (!isAuth && !inAuthGroup) {
          // Not logged in but trying to view protected inner routes -> Redirect to login
          router.replace('/(auth)/login');
        }
      } catch (error) {
        console.error('Error in route protection check:', error);
      }
    };

    verifyAndProtect();
  }, [isReady, segments]);

  if (!isReady) {
    return null; // Don't render until we intentionally route them
  }

  return (
    <ThemeProvider>
      <TaskProvider>
        <NavigationWrapper />
      </TaskProvider>
    </ThemeProvider>
  );
}
