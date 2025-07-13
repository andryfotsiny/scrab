// src/features/admin/components/SubscriptionsList/SubscriptionStats.tsx

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/src/shared/context/ThemeContext';
import Text from '@/src/components/atoms/Text';
import { spacing } from '@/src/styles';

interface SubscriptionStatistics {
    total_users: number;
    paid_users: number;
    trial_active: number;
    trial_expired: number;
    trial_not_started: number;
    conversion_rate: number;
}

interface SubscriptionStatsProps {
    statistics?: SubscriptionStatistics;
}

export default function SubscriptionStats({ statistics }: SubscriptionStatsProps) {
    const { colors } = useTheme();

    if (!statistics) return null;

    const statsData = [
        {
            value: statistics.paid_users,
            label: 'Utilisateurs payants',
            color: colors.success,
        },
        {
            value: statistics.trial_active,
            label: 'Période d\'essai active',
            color: colors.warning,
        },
        {
            value: statistics.trial_expired,
            label: 'Période d\'essai expirée',
            color: colors.error,
        },
        {
            value: `${statistics.conversion_rate}%`,
            label: 'Taux de conversion',
            color: colors.primary,
        },
    ];

    return (
        <View style={[
            styles.statsContainer,
            { backgroundColor: colors.surface, borderColor: colors.border }
        ]}>
            <Text variant="heading3" color="text" style={styles.statsTitle}>
                Statistiques d'abonnement
            </Text>
            <View style={styles.statsGrid}>
                {statsData.map((stat, index) => (
                    <View key={index} style={styles.statCard}>
                        <Text variant="heading2" style={{ color: stat.color }} weight="bold">
                            {stat.value}
                        </Text>
                        <Text variant="caption" color="textSecondary">
                            {stat.label}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    statsContainer: {
        marginHorizontal: spacing.lg,
        marginBottom: spacing.md,
        padding: spacing.lg,
        borderRadius: 12,
        borderWidth: 1,
    },
    statsTitle: {
        marginBottom: spacing.lg,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
    },
    statCard: {
        flex: 1,
        minWidth: '45%',
        alignItems: 'center',
        padding: spacing.md,
        backgroundColor: 'rgba(0,0,0,0.02)',
        borderRadius: 8,
        gap: spacing.xs,
    },
});