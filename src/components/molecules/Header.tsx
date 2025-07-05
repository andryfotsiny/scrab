// src/components/molecules/Header.tsx
import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/src/shared/context/ThemeContext';
import { spacing, typography, shadows } from '@/src/styles';

interface HeaderProps {
    title: string;
    showBackButton?: boolean;
    onBackPress?: () => void;
    rightComponent?: React.ReactNode;
    backgroundColor?: string;
    textColor?: string;
    style?: ViewStyle;
    titleStyle?: TextStyle;
    elevated?: boolean;
    showBorder?: boolean;
}

export default function Header({
                                   title,
                                   showBackButton = true,
                                   onBackPress,
                                   rightComponent,
                                   backgroundColor,
                                   textColor,
                                   style,
                                   titleStyle,
                                   elevated = false,
                                   showBorder = false,
                               }: HeaderProps) {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();

    const handleBackPress = () => {
        if (onBackPress) {
            onBackPress();
        } else {
            router.back();
        }
    };

    const getHeaderStyle = (): ViewStyle => {
        const baseStyle: ViewStyle = {
            backgroundColor: backgroundColor || colors.background,
            // paddingTop: insets.top,
            paddingHorizontal: spacing.lg,
            paddingBottom: spacing.xs,
        };

        if (elevated) {
            return {
                ...baseStyle,
                ...shadows.sm,
            };
        }

        if (showBorder) {
            return {
                ...baseStyle,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
            };
        }

        return baseStyle;
    };

    return (
        <View style={[getHeaderStyle(), style]}>
            <View style={styles.content}>
                {/* Left side - Back button or placeholder */}
                <View style={styles.leftContainer}>
                    {showBackButton ? (
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={handleBackPress}
                            activeOpacity={0.7}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Ionicons
                                name="arrow-back"
                                size={24}
                                color={textColor || colors.text}
                            />
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.placeholder} />
                    )}
                </View>

                {/* Center - Title */}
                <View style={styles.centerContainer}>
                    <Text
                        style={[
                            styles.title,
                            { color: textColor || colors.text },
                            titleStyle
                        ]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {title}
                    </Text>
                </View>

                {/* Right side - Custom component or placeholder */}
                <View style={styles.rightContainer}>
                    {rightComponent || <View style={styles.placeholder} />}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 44,
    },
    leftContainer: {
        width: 44,
        alignItems: 'flex-start',
    },
    centerContainer: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: spacing.sm,
    },
    rightContainer: {
        width: 44,
        alignItems: 'flex-end',
    },
    backButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 22,
    },
    title: {
        fontSize: typography.fontSize.xl,
        fontFamily: typography.fontFamily.bold,
        textAlign: 'center',
    },
    placeholder: {
        width: 44,
        height: 44,
    },
});