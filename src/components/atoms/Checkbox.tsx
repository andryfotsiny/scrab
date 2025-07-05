// src/components/atoms/Checkbox.tsx
import React from 'react';
import {
    TouchableOpacity,
    View,
    StyleSheet,
    ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/shared/context/ThemeContext';
import { spacing, borderRadius } from '@/src/styles';
import Text from './Text';

interface CheckboxProps {
    checked: boolean;
    onPress: () => void;
    label?: string;
    disabled?: boolean;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'rounded';
    style?: ViewStyle;
}

export default function Checkbox({
                                     checked,
                                     onPress,
                                     label,
                                     disabled = false,
                                     size = 'md',
                                     variant = 'default',
                                     style,
                                 }: CheckboxProps) {
    const { colors } = useTheme();

    const getCheckboxStyle = (): ViewStyle => {
        const sizeStyles = {
            sm: { width: 20, height: 20 },
            md: { width: 24, height: 24 },
            lg: { width: 28, height: 28 },
        };

        const variantStyles = {
            default: { borderRadius: borderRadius.sm },
            rounded: { borderRadius: borderRadius.full },
        };

        return {
            borderWidth: 2,
            borderColor: disabled ? colors.border : colors.primary,
            backgroundColor: checked ? colors.primary : 'transparent',
            justifyContent: 'center',
            alignItems: 'center',
            opacity: disabled ? 0.5 : 1,
            ...sizeStyles[size],
            ...variantStyles[variant],
        };
    };

    const getIconSize = () => {
        const iconSizes = {
            sm: 12,
            md: 16,
            lg: 20,
        };
        return iconSizes[size];
    };

    return (
        <TouchableOpacity
            style={[styles.container, style]}
            onPress={onPress}
            disabled={disabled}
            activeOpacity={0.7}
        >
            <View style={getCheckboxStyle()}>
                {checked && (
                    <Ionicons
                        name="checkmark"
                        size={getIconSize()}
                        color="#ffffff"
                    />
                )}
            </View>

            {label && (
                <Text
                    variant="body"
                    color={disabled ? 'textSecondary' : 'text'}
                    style={styles.label}
                >
                    {label}
                </Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    label: {
        flex: 1,
    },
});