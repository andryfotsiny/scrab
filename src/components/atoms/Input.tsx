// src/components/atoms/Input.tsx
import React from 'react';
import {
    TextInput,
    Text,
    View,
    StyleSheet,
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
    containerStyle?: ViewStyle;
    inputStyle?: TextStyle;
    labelStyle?: TextStyle;
    required?: boolean;
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
                                  ...textInputProps
                              }: InputProps) {
    const { colors } = useTheme();

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
            {label && (
                <Text style={[getLabelStyle(), labelStyle]}>
                    {label}
                    {required && <Text style={{ color: colors.error }}> *</Text>}
                </Text>
            )}

            <TextInput
                style={[getInputStyle(), inputStyle]}
                placeholderTextColor={colors.textSecondary}
                {...textInputProps}
            />

            {(helperText || error) && (
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
});