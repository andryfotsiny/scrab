// src/components/atoms/Input.tsx
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
    TextInput,
    Text,
    View,
    Pressable,
    StyleSheet,
    StyleProp,
    ViewStyle,
    TextStyle,
    TextInputProps,
} from 'react-native';
import { useTheme } from '@/src/shared/context/ThemeContext';
import { spacing, typography, borderRadius } from '@/src/styles';

interface InputProps extends Omit<TextInputProps, 'style'> {
    label?: string;
    helperText?: string;
    error?: string;
    variant?: 'default' | 'filled';
    size?: 'sm' | 'md' | 'lg';
    containerStyle?: StyleProp<ViewStyle>;
    inputStyle?: TextStyle;
    labelStyle?: TextStyle;
    required?: boolean;
    /** Champ mot de passe avec bouton œil (afficher/masquer) */
    passwordToggle?: boolean;
}

export default function Input({
                                  label,
                                  helperText,
                                  error,
                                  variant = 'default',
                                  size = 'md',
                                  containerStyle,
                                  inputStyle,
                                  labelStyle,
                                  required = false,
                                  passwordToggle = false,
                                  ...textInputProps
                              }: InputProps) {
    const { colors } = useTheme();
    const [showPassword, setShowPassword] = useState(false);

    const getInputStyle = (): TextStyle => {
        const baseStyle: TextStyle = {
            borderRadius: borderRadius.md,
            fontFamily: typography.fontFamily.regular,
            color: colors.text,
        };

        // Size styles
        const sizeStyles = {
            sm: {
                paddingHorizontal: spacing.sm,
                paddingVertical: spacing.xs,
                fontSize: typography.fontSize.sm,
                minHeight: 36,
            },
            md: {
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                fontSize: typography.fontSize.md,
                minHeight: 48,
            },
            lg: {
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.md,
                fontSize: typography.fontSize.lg,
                minHeight: 56,
            },
        };

        // Variant styles
        const variantStyles = {
            default: {
                backgroundColor: colors.background,
                borderWidth: 1,
                borderColor: error ? colors.error : colors.border,
            },
            filled: {
                backgroundColor: colors.surface,
                borderWidth: 0,
            },
        };

        return {
            ...baseStyle,
            ...sizeStyles[size],
            ...variantStyles[variant],
        };
    };

    const getLabelStyle = (): TextStyle => {
        return {
            fontSize: typography.fontSize.sm,
            fontFamily: typography.fontFamily.bold,
            color: error ? colors.error : colors.text,
            marginBottom: spacing.xs,
        };
    };

    const getHelperTextStyle = (): TextStyle => {
        return {
            fontSize: typography.fontSize.xs,
            fontFamily: typography.fontFamily.regular,
            color: error ? colors.error : colors.textSecondary,
            marginTop: spacing.xs,
        };
    };

    return (
        <View style={[styles.container, containerStyle]}>
            {!!label && (
                <Text style={[getLabelStyle(), labelStyle]}>
                    {label}
                    {required && <Text style={{ color: colors.error }}> *</Text>}
                </Text>
            )}

            <View>
                <TextInput
                    style={[getInputStyle(), passwordToggle && { paddingRight: 48 }, inputStyle]}
                    placeholderTextColor={colors.textSecondary}
                    {...textInputProps}
                    secureTextEntry={passwordToggle ? !showPassword : textInputProps.secureTextEntry}
                />
                {passwordToggle && (
                    <Pressable
                        onPress={() => setShowPassword((visible) => !visible)}
                        style={styles.toggle}
                        hitSlop={8}
                        accessibilityRole="button"
                        accessibilityLabel={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    >
                        <Ionicons
                            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                            size={22}
                            color={colors.textSecondary}
                        />
                    </Pressable>
                )}
            </View>

            {!!(helperText || error) && (
                <Text style={getHelperTextStyle()}>
                    {error || helperText}
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.md,
    },
    toggle: {
        position: 'absolute',
        right: spacing.md,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
    },
});