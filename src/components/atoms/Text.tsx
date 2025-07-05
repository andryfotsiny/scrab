// src/components/atoms/Text.tsx
import React from 'react';
import {
    Text as RNText,
    TextProps as RNTextProps,
    StyleSheet,
    TextStyle,
} from 'react-native';
import { useTheme } from '@/src/shared/context/ThemeContext';
import { typography } from '@/src/styles';

interface TextProps extends RNTextProps {
    variant?: 'heading1' | 'heading2' | 'heading3' | 'body' | 'caption' | 'label';
    weight?: 'regular' | 'bold';
    color?: 'primary' | 'secondary' | 'text' | 'textSecondary' | 'success' | 'error' | 'warning';
    align?: 'left' | 'center' | 'right';
    children: React.ReactNode;
}

export default function Text({
                                 variant = 'body',
                                 weight = 'regular',
                                 color = 'text',
                                 align = 'left',
                                 style,
                                 children,
                                 ...textProps
                             }: TextProps) {
    const { colors } = useTheme();

    const getTextStyle = (): TextStyle => {
        const baseStyle: TextStyle = {
            fontFamily: weight === 'bold' ? typography.fontFamily.bold : typography.fontFamily.regular,
            textAlign: align,
        };

        // Variant styles
        const variantStyles = {
            heading1: {
                fontSize: typography.fontSize.xxxl,
                lineHeight: typography.fontSize.xxxl * typography.lineHeight.tight,
                fontFamily: typography.fontFamily.bold,
            },
            heading2: {
                fontSize: typography.fontSize.xxl,
                lineHeight: typography.fontSize.xxl * typography.lineHeight.tight,
                fontFamily: typography.fontFamily.bold,
            },
            heading3: {
                fontSize: typography.fontSize.xl,
                lineHeight: typography.fontSize.xl * typography.lineHeight.normal,
                fontFamily: typography.fontFamily.bold,
            },
            body: {
                fontSize: typography.fontSize.md,
                lineHeight: typography.fontSize.md * typography.lineHeight.normal,
            },
            caption: {
                fontSize: typography.fontSize.sm,
                lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
            },
            label: {
                fontSize: typography.fontSize.xs,
                lineHeight: typography.fontSize.xs * typography.lineHeight.normal,
                fontFamily: typography.fontFamily.bold,
            },
        };

        // Color styles
        const colorStyles = {
            primary: { color: colors.primary },
            secondary: { color: colors.secondary },
            text: { color: colors.text },
            textSecondary: { color: colors.textSecondary },
            success: { color: colors.success },
            error: { color: colors.error },
            warning: { color: colors.warning },
        };

        return {
            ...baseStyle,
            ...variantStyles[variant],
            ...colorStyles[color],
        };
    };

    return (
        <RNText style={[getTextStyle(), style]} {...textProps}>
            {children}
        </RNText>
    );
}