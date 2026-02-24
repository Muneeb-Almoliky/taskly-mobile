import Button from "@/components/Button";
import Input from "@/components/Input";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { login, storeEmail } from "../../services/authService";

export default function LoginScreen() {
    const router = useRouter();
    const fadeAnim = useState(new Animated.Value(0))[0];
    const slideAnim = useState(new Animated.Value(50))[0];

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const textColor = useThemeColor({}, 'text');
    const tintColor = useThemeColor({}, 'tint');
    const backgroundColor = useThemeColor({}, 'background');
    const cardColor = useThemeColor({}, 'card');
    const borderColor = useThemeColor({}, 'border');
    
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) return Alert.alert("Error", "Please fill in all fields");

        setIsLoading(true);
        try {
            const data: any = await login({email, password});
            console.log(data);
            storeEmail(email);
            router.replace("/");
        } catch (error) {
            Alert.alert("Error", "Login failed. Please check your credentials.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <View style={[styles.container, { backgroundColor }]}>
            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <Animated.View 
                    style={[
                        styles.formContainer, 
                        { backgroundColor: cardColor, borderColor },
                        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
                    ]}
                >
                    <Text style={[styles.title, { color: textColor }]}>Welcome Back</Text>
                    <Text style={[styles.subtitle, { color: textColor }]}>
                        Sign in to continue organizing your tasks
                    </Text>

                    <View style={styles.inputContainer}>
                        <Input
                            placeholder="Email address"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            style={styles.input}
                            placeholderTextColor="#9CA3AF"
                        />
                        <Input
                            placeholder="Password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            style={styles.input}
                            placeholderTextColor="#9CA3AF"
                        />
                        
                        <TouchableOpacity style={styles.forgotPassword}>
                            <Text style={[styles.forgotPasswordText, { color: tintColor }]}>
                                Forgot password?
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <Button 
                        title={isLoading ? "Signing In..." : "Sign In"} 
                        onPress={handleLogin} 
                        style={styles.button}
                        disabled={isLoading}
                    />

                    <View style={styles.divider}>
                        <View style={[styles.dividerLine, { backgroundColor: borderColor }]} />
                        <Text style={[styles.dividerText, { color: textColor }]}>or</Text>
                        <View style={[styles.dividerLine, { backgroundColor: borderColor }]} />
                    </View>

                    <TouchableOpacity 
                        onPress={() => router.push('/signup')}
                        style={styles.signupLink}
                    >
                        <Text style={[styles.signupText, { color: textColor }]}>
                            Don't have an account?{' '}
                        </Text>
                        <Text style={[styles.signupLinkText, { color: tintColor }]}>
                            Sign up
                        </Text>
                    </TouchableOpacity>
                </Animated.View>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    formContainer: {
        borderRadius: 12,
        padding: 24,
        borderWidth: 1,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        opacity: 0.7,
        textAlign: 'center',
        marginBottom: 32,
    },
    inputContainer: {
        marginBottom: 24,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        fontSize: 16,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginTop: -8,
        marginBottom: 16,
    },
    forgotPasswordText: {
        fontSize: 14,
        fontWeight: '600',
    },
    button: {
        borderRadius: 12,
        padding: 18,
        marginBottom: 24,
        fontSize: 16,
        fontWeight: '600',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
    },
    dividerText: {
        marginHorizontal: 16,
        fontSize: 14,
        fontWeight: '500',
    },
    signupLink: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    signupText: {
        fontSize: 16,
    },
    signupLinkText: {
        fontSize: 16,
        fontWeight: '600',
    }
});