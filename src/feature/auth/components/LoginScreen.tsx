// src/features/auth/components/LoginScreen.tsx
import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/src/shared/context/ThemeContext';
import {authService} from "@/src/shared/services/api/auth/auth.api";
import ThemeToggle from "@/src/components/atoms/ThemeToggle";

export default function LoginScreen() {
    const { colors, mode } = useTheme();
    const [loading, setLoading] = useState(false);

    const handleLogin = useCallback(async () => {
        setLoading(true);

        try {
            // Appel API réel
            const loginResponse = await authService.login();
            console.log('Login response:', loginResponse);

            // Navigation vers l'écran principal après succès
            router.replace('/(main)');
        } catch (error) {
            console.error('Login error:', error);
            Alert.alert(
                'Erreur de connexion',
                'Impossible de se connecter. Veuillez réessayer.'
            );
        } finally {
            setLoading(false);
        }
    }, []);

    // Styles dynamiques basés sur le thème
    const dynamicStyles = {
        container: { backgroundColor: colors.background },
        title: { color: colors.text },
        subtitle: { color: colors.textSecondary },
        loginTitle: { color: colors.text },
        loginDescription: { color: colors.textSecondary },
        footerText: { color: colors.textSecondary },
    };

    return (
        <SafeAreaView style={[styles.container, dynamicStyles.container]}>
            <StatusBar
                barStyle={mode === 'dark' ? 'light-content' : 'dark-content'}
                backgroundColor={colors.background}
            />

            {/* Header avec toggle thème */}
            <View style={styles.header}>
                <ThemeToggle />
            </View>

            <View style={styles.content}>
                {/* Logo */}
                <View style={styles.logoContainer}>
                    <View style={[styles.logo, { backgroundColor: colors.primary }]}>
                        <Text style={styles.logoText}>S</Text>
                    </View>
                    <Text style={[styles.title, dynamicStyles.title]}>Scrab</Text>
                    <Text style={[styles.subtitle, dynamicStyles.subtitle]}>
                        Bienvenue sur votre application de paris
                    </Text>
                </View>

                {/* Section de connexion */}
                <View style={styles.loginSection}>
                    <Text style={[styles.loginTitle, dynamicStyles.loginTitle]}>Connexion</Text>
                    <Text style={[styles.loginDescription, dynamicStyles.loginDescription]}>
                        Appuyez sur le bouton ci-dessous pour vous connecter à votre compte Bet261
                    </Text>

                    <TouchableOpacity
                        style={[
                            styles.loginButton,
                            { backgroundColor: colors.primary },
                            loading && styles.loginButtonDisabled
                        ]}
                        onPress={handleLogin}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.loginButtonText}>
                            {loading ? 'Connexion...' : 'Se connecter'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.footer}>
                <Text style={[styles.footerText, dynamicStyles.footerText]}>Version 1.0.0</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 16,
        alignItems: 'flex-end',
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 96,
    },
    logo: {
        width: 100,
        height: 100,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 8,
    },
    logoText: {
        fontSize: 32,
        fontFamily: 'Poppins_700Bold',
        color: '#ffffff',
    },
    title: {
        fontSize: 32,
        fontFamily: 'Poppins_700Bold',
        marginTop: 24,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        fontFamily: 'Poppins_400Regular',
        textAlign: 'center',
        lineHeight: 24,
    },
    loginSection: {
        alignItems: 'center',
    },
    loginTitle: {
        fontSize: 24,
        fontFamily: 'Poppins_700Bold',
        marginBottom: 16,
    },
    loginDescription: {
        fontSize: 16,
        fontFamily: 'Poppins_400Regular',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 48,
        paddingHorizontal: 24,
    },
    loginButton: {
        width: '100%',
        maxWidth: 280,
        paddingHorizontal: 32,
        paddingVertical: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        elevation: 4,
    },
    loginButtonDisabled: {
        opacity: 0.6,
    },
    loginButtonText: {
        fontSize: 16,
        fontFamily: 'Poppins_700Bold',
        color: '#ffffff',
    },
    footer: {
        paddingHorizontal: 24,
        paddingBottom: 24,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
        fontFamily: 'Poppins_400Regular',
    },
});