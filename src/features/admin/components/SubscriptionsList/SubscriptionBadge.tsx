// src/features/admin/components/SubscriptionsList/SubscriptionBadge.tsx

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from '@/src/components/atoms/Text';
import { spacing } from '@/src/styles';

interface SubscriptionBadgeProps {
    displayInfo: {
        label: string;
        color: string;
        description: string;
        icon: string;
    };
}

export default function SubscriptionBadge({ displayInfo }: SubscriptionBadgeProps) {
    return (
        <View style={[
            styles.subscriptionBadge,
            {
                backgroundColor: displayInfo.color + '20',
                borderColor: displayInfo.color
            }
        ]}>
            <Ionicons
                name={displayInfo.icon as any}
                size={14}
                color={displayInfo.color}
            />
            <Text variant="caption" style={{ color: displayInfo.color, fontWeight: 'bold' }}>
                {displayInfo.label}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    subscriptionBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: 8,
        borderWidth: 1,
    },
});