// src/components/molecules/TabBar.tsx
import React from 'react';
import {
    View,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    ViewStyle,
} from 'react-native';
import { useTheme } from '@/src/shared/context/ThemeContext';
import { spacing, shadows } from '@/src/styles';
import Text from '../atoms/Text';

export interface TabItem {
    id: string;
    title: string;
    disabled?: boolean;
}

interface TabBarProps {
    tabs: TabItem[];
    activeTab: string;
    onTabPress: (tabId: string) => void;
    variant?: 'default' | 'elevated' | 'minimal';
    scrollable?: boolean;
    style?: ViewStyle;
}

export default function TabBar({
                                   tabs,
                                   activeTab,
                                   onTabPress,
                                   variant = 'default',
                                   scrollable = true,
                                   style,
                               }: TabBarProps) {
    const { colors } = useTheme();

    const getTabBarStyle = (): ViewStyle => {


        const variantStyles = {
            default: {
                backgroundColor: colors.background,

            },
            elevated: {
                backgroundColor: colors.background,
                ...shadows.sm,
                elevation: 2,
                zIndex: 1000,
            },
            minimal: {
                backgroundColor: colors.background,
            },
        };

        return {
            ...variantStyles[variant],
        };
    };

    const renderTab = (tab: TabItem) => {
        const isActive = activeTab === tab.id;
        const isDisabled = tab.disabled;

        return (
            <TouchableOpacity
                key={tab.id}
                style={styles.tabItem}
                onPress={() => !isDisabled && onTabPress(tab.id)}
                activeOpacity={0.7}
                disabled={isDisabled}
            >
                <Text
                    variant="body"
                    weight={isActive ? 'bold' : 'regular'}
                    color={
                        isDisabled
                            ? 'textSecondary'
                            : isActive
                                ? 'primary'
                                : 'textSecondary'
                    }
                    align="center"
                    style={[
                        styles.tabText,
                        isDisabled && styles.disabledText,
                    ]}
                >
                    {tab.title}
                </Text>

                {isActive && (
                    <View
                        style={[
                            styles.tabUnderline,
                            { backgroundColor: colors.primary }
                        ]}
                    />
                )}
            </TouchableOpacity>
        );
    };

    if (scrollable) {
        return (
            <View style={[getTabBarStyle(), styles.wrapper, style]}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    style={styles.scrollContainer}
                    keyboardShouldPersistTaps="handled"
                >
                    {tabs.map(renderTab)}
                </ScrollView>
            </View>
        );
    }

    return (
        <View style={[getTabBarStyle(), styles.wrapper, style]}>
            <View style={styles.fixedContainer}>
                {tabs.map(renderTab)}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        paddingBottom: spacing.xs,
    },
    scrollContainer: {
        paddingHorizontal: spacing.lg,
    },
    scrollContent: {
        paddingRight: spacing.lg,
    },
    fixedContainer: {
        flexDirection: 'row',
        paddingHorizontal: spacing.lg,
    },
    tabItem: {
        position: 'relative',
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.xs,
        marginRight: spacing.xs,
        minWidth: 100,
    },
    tabText: {
        textAlign: 'center',
    },
    disabledText: {
        opacity: 0.5,
    },
    tabUnderline: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 3,
        borderRadius: 2,
    },
});