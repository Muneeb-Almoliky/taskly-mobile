import { useThemeContext } from '@/context/ThemeContext';

export function useColorScheme() {
  const { activeTheme } = useThemeContext();
  return activeTheme;
}
