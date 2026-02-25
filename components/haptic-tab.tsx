import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function HapticTab(props: BottomTabBarButtonProps) {
  const isSelected = props.accessibilityState?.selected;
  const theme = useColorScheme() ?? 'light';

  return (
    <PlatformPressable
      {...props}
      style={[
        props.style,
        {
          borderRadius: 18,
          marginHorizontal: 12,
          marginVertical: 6,
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          backgroundColor: isSelected 
             ? (theme === 'dark' ? 'rgba(255,255,255,0.18)' : `${Colors[theme].tint}20`) 
             : 'transparent'
        }
      ]}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === 'ios') {
          // Add a soft haptic feedback when pressing down on the tabs.
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}
    />
  );
}
