import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

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

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        {screens.map((screen) => (
          <Stack.Screen key={screen.name} {...screen} />
        ))}
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
