// src/features/auth/components/LoginScreen.tsx - UPDATED avec React Query
import React, { useState, useCallback } from 'react';
import {
    View,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    Alert,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
} from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/src/shared/context/ThemeContext';
import { useAuth } from '@/src/shared/context/AuthContext';
import ThemeToggle from '@/src/components/atoms/ThemeToggle';
import Button from '@/src/components/atoms/Button';
import Input from '@/src/components/atoms/Input';
import PhoneInput from '@/src/components/atoms/PhoneInput';
import { validateMgPhone } from '@/src/shared/utils/phone';
import Text from '@/src/components/atoms/Text';
import { spacing } from '@/src/styles';

export default function LoginScreen() {
    const { colors, mode } = useTheme();
    const { login, loading } = useAuth(); // ✅ Utilise maintenant React Query sous le capot

    const [formData, setFormData] = useState({
        bet_login: '',
        bet_password: '',
    });
    const [formErrors, setFormErrors] = useState({
        bet_login: '',
        bet_password: '',
    });
    // Alert.alert ne fait rien sur le web : l'erreur de connexion est aussi affichée dans la page
    const [submitError, setSubmitError] = useState('');

    const handleInputChange = (field: 'bet_login' | 'bet_password', value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setSubmitError('');

        // Clear error when user starts typing
        if (formErrors[field]) {
            setFormErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validateForm = (): boolean => {
        const errors = {
            bet_login: '',
            bet_password: '',
        };

        // Numéro : 9 chiffres après +261 (le 0 initial et l'indicatif sont retirés à la saisie)
        errors.bet_login = validateMgPhone(formData.bet_login);

        // Mot de passe : seule règle = non vide (Bet261 décide du reste) ; jamais de trim : un espace peut en faire partie
        if (!formData.bet_password) {
            errors.bet_password = 'Le mot de passe est requis';
        }

        setFormErrors(errors);
        return !errors.bet_login && !errors.bet_password;
    };

    const handleLogin = useCallback(async () => {
        // Close keyboard
        Keyboard.dismiss();

        if (!validateForm()) {
            return;
        }

        try {

            // ✅ Le login utilise maintenant React Query sous le capot
            const result = await login({
                bet_login: formData.bet_login,
                bet_password: formData.bet_password,
            });

            if (result.success) {

                // Clear form data
                setFormData({ bet_login: '', bet_password: '' });

                // ✅ React Query a automatiquement mis en cache les données utilisateur
                // Navigate directly to main screen
                router.replace('/(main)');
            } else {
                const message = result.error || 'Impossible de se connecter. Veuillez vérifier vos identifiants.';
                setSubmitError(message);
                Alert.alert('Erreur de connexion', message);
            }
        } catch (error) {
            console.error('LoginScreen: Login error:', error);
            const message = 'Une erreur inattendue s\'est produite. Veuillez réessayer.';
            setSubmitError(message);
            Alert.alert('Erreur de connexion', message);
        }
    }, [formData, login]);

    const handleReset = () => {
        Keyboard.dismiss();
        setFormData({ bet_login: '', bet_password: '' });
        setFormErrors({ bet_login: '', bet_password: '' });
        setSubmitError('');
    };

    // Dynamic styles based on theme
    const dynamicStyles = {
        container: { backgroundColor: colors.background },
        title: { color: colors.text },
        subtitle: { color: colors.textSecondary },
        footerText: { color: colors.textSecondary },
    };

    const hasFormData = formData.bet_login || formData.bet_password;
    const isFormValid = validateMgPhone(formData.bet_login) === '' && formData.bet_password.length > 0;

    return (
        <SafeAreaView style={[styles.container, dynamicStyles.container]}>
            <StatusBar
                barStyle={mode === 'dark' ? 'light-content' : 'dark-content'}
                backgroundColor={colors.background}
            />

            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                {/* Header with theme toggle */}
                <View style={styles.header}>
                    <ThemeToggle />
                </View>

                <ScrollView
                    style={styles.flex}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Logo Section */}
                    <View style={styles.logoContainer}>
                        <View style={[styles.logo, { backgroundColor: colors.primary }]}>
                            <Text style={styles.logoText}>S</Text>
                        </View>
                        <Text variant="heading1" color="text" style={styles.title}>
                            Scrab
                        </Text>
                        <Text variant="body" color="textSecondary" style={styles.subtitle}>
                            Connectez-vous à votre compte Bet261
                        </Text>
                    </View>

                    {/* Login Form Section */}
                    <View style={styles.formSection}>
                        <Text variant="heading3" color="text" style={styles.formTitle}>
                            Connexion
                        </Text>

                        <View style={styles.formContainer}>
                            <PhoneInput
                                label="Numéro Bet261"
                                value={formData.bet_login}
                                onChangeDigits={(digits) => handleInputChange('bet_login', digits)}
                                error={formErrors.bet_login}
                                helperText="Exemple : xx xx xxx xx (sans le 0)"
                                required
                            />

                            <Input
                                label="Mot de passe"
                                value={formData.bet_password}
                                onChangeText={(value) => handleInputChange('bet_password', value)}
                                placeholder="Votre mot de passe"
                                secureTextEntry={true}
                                passwordToggle
                                autoCapitalize="none"
                                autoCorrect={false}
                                returnKeyType="done"
                                error={formErrors.bet_password}
                                required
                                onSubmitEditing={handleLogin}
                            />

                            {/* Action Buttons */}
                            <View style={styles.actionButtons}>
                                <Button
                                    title="Effacer"
                                    onPress={handleReset}
                                    variant="outline"
                                    size="sm"
                                    disabled={!hasFormData || loading}
                                    style={{ flex: 1 }}
                                />

                                <Button
                                    title={loading ? 'Connexion...' : 'Se connecter'}
                                    onPress={handleLogin}
                                    variant="primary"
                                    size="sm"
                                    disabled={!isFormValid || loading}
                                    loading={loading}
                                    style={{ flex: 1 }}
                                />
                            </View>
                        </View>

                        {/* Erreur de connexion (visible aussi sur le web, où Alert.alert ne fait rien) */}
                        {!!submitError && (
                            <View style={styles.helperContainer}>
                                <Text variant="caption" color="error" style={styles.helperText}>
                                    {submitError}
                                </Text>
                            </View>
                        )}

                        <View style={styles.helperContainer}>
                            <Text variant="caption" color="textSecondary" style={styles.helperText}>
                                Utilisez le numéro et le mot de passe de votre compte Bet261.
                            </Text>
                        </View>
                    </View>
                </ScrollView>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text variant="caption" color="textSecondary">
                        Version 1.0.0 - Powered by React Query 🚀
                    </Text>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    flex: {
        flex: 1,
    },
    header: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        alignItems: 'flex-end',
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: spacing.lg,
        justifyContent: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: spacing.xl * 2,
    },
    logo: {
        width: 80,
        height: 80,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 8,
        marginBottom: spacing.lg,
    },
    logoText: {
        fontSize: 28,
        fontFamily: 'Poppins_700Bold',
        color: '#ffffff',
    },
    title: {
        marginBottom: spacing.xs,
    },
    subtitle: {
        textAlign: 'center',
        lineHeight: 24,
    },
    formSection: {
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
    },
    formTitle: {
        textAlign: 'center',
        marginBottom: spacing.xl,
    },
    formContainer: {
        gap: spacing.md,
        marginBottom: spacing.lg,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginTop: spacing.md,
    },
    helperContainer: {
        paddingHorizontal: spacing.md,
    },
    helperText: {
        textAlign: 'center',
        lineHeight: 20,
    },
    footer: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.lg,
        alignItems: 'center',
    },
});