// src/components/molecules/Card.tsx
import React from 'react';
import {
    View,
    StyleSheet,
    ViewStyle,
} from 'react-native';
import { useTheme } from '@/src/shared/context/ThemeContext';
import { spacing, shadows } from '@/src/styles';
import Text from '../atoms/Text';

interface CardProps {
    title?: string;
    children: React.ReactNode;
    variant?: 'default' | 'elevated' | 'outlined';
    padding?: 'sm' | 'md' | 'lg';
    style?: ViewStyle;
    headerComponent?: React.ReactNode;
}

export default function Card({
                                 title,
                                 children,
                                 variant = 'default',
                                 padding = 'lg',
                                 style,
                                 headerComponent,
                             }: CardProps) {
    const { colors } = useTheme();

    const getCardStyle = (): ViewStyle => {
        const baseStyle: ViewStyle = {
            borderRadius: 12,
            backgroundColor: colors.surface,
        };

        const paddingStyles = {
            sm: { padding: spacing.sm },
            md: { padding: spacing.md },
            lg: { padding: spacing.lg },
        };

        const variantStyles = {
            default: {
                backgroundColor: colors.surface,
            },
            elevated: {
                backgroundColor: colors.surface,
                ...shadows.md,
            },
            outlined: {
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
            },
        };

        return {
            ...baseStyle,
            ...paddingStyles[padding],
            ...variantStyles[variant],
        };
    };

    return (
        <View style={[getCardStyle(), style]}>
            {/* Header */}
            {(title || headerComponent) && (
                <View style={styles.header}>
                    {title && (
                        <Text variant="heading3" color="text" style={styles.title}>
                            {title}
                        </Text>
                    )}
                    {headerComponent}
                </View>
            )}

            {/* Content */}
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    title: {
        flex: 1,
    },
});