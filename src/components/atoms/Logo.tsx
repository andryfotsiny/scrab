// src/components/atoms/Logo.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../shared/context/ThemeContext';
import { typography, borderRadius, spacing } from '../../styles';

interface LogoProps {
    size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ size = 'md' }: LogoProps) {
    const { colors } = useTheme();

    const getSizeStyles = () => {
        const sizes = {
            sm: {
                container: { width: 60, height: 60 },
                text: { fontSize: typography.fontSize.lg },
            },
            md: {
                container: { width: 80, height: 80 },
                text: { fontSize: typography.fontSize.xxl },
            },
            lg: {
                container: { width: 100, height: 100 },
                text: { fontSize: typography.fontSize.xxxl },
            },
        };
        return sizes[size];
    };

    const sizeStyles = getSizeStyles();

    return (
        <View
            style={[
                styles.container,
                sizeStyles.container,
                {
                    backgroundColor: colors.primary,
                },
            ]}
        >
            <Text
                style={[
                    styles.text,
                    sizeStyles.text,
                    {
                        color: '#ffffff',
                    },
                ]}
            >
                S
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: borderRadius.xl,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 8,
    },
    text: {
        fontFamily: typography.fontFamily.bold,
        textAlign: 'center',
    },
});