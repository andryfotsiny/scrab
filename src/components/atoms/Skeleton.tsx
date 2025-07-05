// src/components/atoms/Skeleton.tsx
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '@/src/shared/context/ThemeContext';

interface SkeletonProps {
    width?: number | string;
    height?: number;
    borderRadius?: number;
    style?: any;
    animated?: boolean;
}

const Skeleton: React.FC<SkeletonProps> = ({
                                               width = '100%',
                                               height = 20,
                                               borderRadius = 4,
                                               style,
                                               animated = true,
                                           }) => {
    const { colors } = useTheme();
    const shimmerAnimation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!animated) return;

        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(shimmerAnimation, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: false,
                }),
                Animated.timing(shimmerAnimation, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: false,
                }),
            ])
        );

        animation.start();

        return () => animation.stop();
    }, [shimmerAnimation, animated]);

    const backgroundColor = shimmerAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [colors.skeleton, colors.skeletonHighlight],
    });

    return (
        <Animated.View
            style={[
                styles.skeleton,
                {
                    width,
                    height,
                    borderRadius,
                    backgroundColor: animated ? backgroundColor : colors.skeleton,
                },
                style,
            ]}
        />
    );
};

// Composants spécialisés pour différents cas d'usage
export const SkeletonText: React.FC<{ lines?: number; lastLineWidth?: string }> = ({
                                                                                       lines = 1,
                                                                                       lastLineWidth = '70%',
                                                                                   }) => (
    <View style={styles.textContainer}>
        {Array.from({ length: lines }).map((_, index) => (
            <Skeleton
                key={index}
                height={16}
                width={index === lines - 1 && lines > 1 ? lastLineWidth : '100%'}
                style={index < lines - 1 ? { marginBottom: 8 } : undefined}
            />
        ))}
    </View>
);

export const SkeletonCard: React.FC<{ height?: number }> = ({ height = 120 }) => {
    const { colors } = useTheme();

    return (
        <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
                <Skeleton width="60%" height={20} />
                <Skeleton width={60} height={24} borderRadius={12} />
            </View>
            <View style={styles.cardContent}>
                <SkeletonText lines={2} />
            </View>
        </View>
    );
};

export const SkeletonButton: React.FC<{ width?: string | number }> = ({ width = '100%' }) => (
    <Skeleton width={width} height={48} borderRadius={8} />
);

export const SkeletonAvatar: React.FC<{ size?: number }> = ({ size = 40 }) => (
    <Skeleton width={size} height={size} borderRadius={size / 2} />
);

export const SkeletonInput: React.FC<{}> = () => (
    <View style={styles.inputContainer}>
        <Skeleton width="30%" height={14} style={{ marginBottom: 8 }} />
        <Skeleton width="100%" height={48} borderRadius={8} />
    </View>
);

const styles = StyleSheet.create({
    skeleton: {
        overflow: 'hidden',
    },
    textContainer: {
        flex: 1,
    },
    card: {
        borderRadius: 8,
        padding: 16,
        borderWidth: 1,
        marginBottom: 12,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    cardContent: {
        gap: 8,
    },
    inputContainer: {
        marginBottom: 16,
    },
});

export default Skeleton;