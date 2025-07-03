// src/components/atoms/Button.tsx
import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ViewStyle,
    TextStyle,
    ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../shared/context/ThemeContext';
import { spacing, typography, borderRadius, shadows } from '../../styles';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    loading?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export default function Button({
                                   title,
                                   onPress,
                                   variant = 'primary',
                                   size = 'md',
                                   disabled = false,
                                   loading = false,
                                   style,
                                   textStyle,
                               }: ButtonProps) {
    const { colors } = useTheme();

    const getButtonStyle = (): ViewStyle => {
        const baseStyle: ViewStyle = {
            borderRadius: borderRadius.lg,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
        };

        // Size styles
        const sizeStyles = {
            sm: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, minHeight: 36 },
            md: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, minHeight: 48 },
            lg: { paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, minHeight: 56 },
        };

        // Variant styles
        const variantStyles = {
            primary: {
                backgroundColor: disabled ? colors.border : colors.primary,
                ...shadows.md,
            },
            secondary: {
                backgroundColor: disabled ? colors.border : colors.secondary,
            },
            outline: {
                backgroundColor: 'transparent',
                borderWidth: 2,
                borderColor: disabled ? colors.border : colors.primary,
            },
        };

        return {
            ...baseStyle,
            ...sizeStyles[size],
            ...variantStyles[variant],
            opacity: disabled || loading ? 0.6 : 1,
        };
    };

    const getTextStyle = (): TextStyle => {
        const baseStyle: TextStyle = {
            fontFamily: typography.fontFamily.bold,
            textAlign: 'center',
        };

        const sizeStyles = {
            sm: { fontSize: typography.fontSize.sm },
            md: { fontSize: typography.fontSize.md },
            lg: { fontSize: typography.fontSize.lg },
        };

        const variantStyles = {
            primary: { color: '#ffffff' },
            secondary: { color: colors.text },
            outline: { color: disabled ? colors.textSecondary : colors.primary },
        };

        return {
            ...baseStyle,
            ...sizeStyles[size],
            ...variantStyles[variant],
        };
    };

    return (
        <TouchableOpacity
            style={[getButtonStyle(), style]}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
        >
            {loading && (
                <ActivityIndicator
                    size="small"
                    color={variant === 'primary' ? '#ffffff' : colors.primary}
                    style={{ marginRight: spacing.sm }}
                />
            )}
            <Text style={[getTextStyle(), textStyle]}>{title}</Text>
        </TouchableOpacity>
    );
}