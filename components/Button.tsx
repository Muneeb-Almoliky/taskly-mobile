import { useThemeColor } from "@/hooks/use-theme-color";
import { StyleSheet, Text, TouchableOpacity, TouchableOpacityProps } from "react-native";

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
        {},
        variant === 'primary' ? 'background' : 'tint'
    );

    const borderStyle = variant === 'secondary' ? { borderWidth: 1, borderColor: useThemeColor({}, 'tint') } : {};

    return (
        <TouchableOpacity
            {...props}
            style={[styles.button, { backgroundColor, ...borderStyle }, style]}
        >
            <Text style={[styles.text, { color: textColor }]}>
                {title}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        padding: 15,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
    },
    text: {
        fontSize: 16,
        fontWeight: '600',
    },
});