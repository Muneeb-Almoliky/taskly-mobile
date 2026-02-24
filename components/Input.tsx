import { useThemeColor } from "@/hooks/use-theme-color";
import { StyleSheet, TextInput, TextInputProps } from "react-native";

export default function Input({ style, ...props }: TextInputProps) {
    const borderColor = useThemeColor({}, 'border');
    const textColor = useThemeColor({}, 'text');
    const placeholderColor = useThemeColor({}, 'icon');

    return (
        <TextInput
            {...props}
            placeholderTextColor={props.placeholderTextColor || placeholderColor}
            style={[styles.input, { borderColor, color: textColor }, style]}
        />
    );
}

const styles = StyleSheet.create({
    input: {
        borderWidth: 1,
        padding: 14,
        borderRadius: 8,
        marginBottom: 14,
        width: '100%',
        fontSize: 15,
    },
});