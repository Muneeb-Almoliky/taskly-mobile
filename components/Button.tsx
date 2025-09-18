import { useThemeColor } from "@/hooks/use-theme-color";
import { TouchableOpacity, TouchableOpacityProps, Text, StyleSheet } from "react-native";

interface ButtonProps extends TouchableOpacityProps {
    title: string;
    variant?: 'primary' | 'secondary';
}
export default function Button({ title, variant = 'primary', style, ...props}: ButtonProps) {
    const backgroundColor = useThemeColor(
        variant === 'secondary' ? { light: '#fff', dark: '#151718' } : {},
        variant === 'primary' ? 'tint' : 'background'
    );

    const textColor = useThemeColor(
        variant === 'secondary' ? {} : {},
        variant === 'primary' ? 'background' : 'tint'
    );

    const borderStyle = variant === 'secondary' ? { borderWidth: 1, borderColor: useThemeColor({}, 'tint') } : {};

    return (
        <TouchableOpacity
            {...props}
            style={[
                {
                    padding: 14,
                    borderRadius: 8,
                    width: '100%',
                    alignItems: 'center',
                    backgroundColor,
                    ...borderStyle,
                },
                style
            ]}
        >
            <Text style={{color: textColor, fontWeight: '600', fontFamily: 'sans-serif'}}>
                {title}
            </Text>
        </TouchableOpacity>
    )

    
}