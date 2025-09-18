import { TextInputProps, TextInput } from "react-native";

import { useThemeColor } from "@/hooks/use-theme-color";


export default function Input(props: TextInputProps) {
    const borderColor = useThemeColor({}, 'icon');
    const textColor = useThemeColor({}, 'text');

    return(
        <TextInput
            {...props}
            placeholderTextColor={borderColor}
            style={{
                borderWidth: 1,
                borderColor,
                padding: 12,
                borderRadius: 8,
                marginBottom: 14,
                width: '100%',
                color: textColor,
                fontFamily: 'sans-serif'
            }}
        />
    )

}