import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

interface HeaderProps {
    title: string;
    subtitle?: string;
    showBackButton?: boolean;
    rightElement?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}

export default function Header({ 
    title, 
    subtitle, 
    showBackButton = false, 
    rightElement, 
    style 
}: HeaderProps) {
    const router = useRouter();
    
    const textColor = useThemeColor({}, 'text');
    const cardColor = useThemeColor({}, 'card');
    const borderColor = useThemeColor({}, 'border');

    return (
        <View style={[
            styles.header, 
            { backgroundColor: cardColor, borderBottomColor: borderColor },
            style
        ]}>
            <View style={styles.row}>
                {/* Back Button (only when explicitly shown) */}
                {showBackButton && (
                    <TouchableOpacity 
                        onPress={() => router.back()} 
                        style={styles.backButton}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons name="chevron-back" size={22} color={textColor} />
                    </TouchableOpacity>
                )}

                {/* Title Block */}
                <View style={styles.titleBlock}>
                    <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>
                        {title}
                    </Text>
                    {subtitle && (
                        <Text style={[styles.subtitle, { color: '#9CA3AF' }]} numberOfLines={1}>
                            {subtitle}
                        </Text>
                    )}
                </View>

                {/* Right Slot */}
                {rightElement ? (
                    <View style={styles.rightSlot}>{rightElement}</View>
                ) : showBackButton ? (
                    <View style={styles.spacer} />
                ) : null}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingTop: 54,
        paddingBottom: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    titleBlock: {
        flex: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        letterSpacing: -0.3,
    },
    subtitle: {
        fontSize: 13,
        marginTop: 1,
    },
    spacer: {
        width: 32,
    },
    rightSlot: {
        marginLeft: 8,
        alignItems: 'flex-end',
    },
});
