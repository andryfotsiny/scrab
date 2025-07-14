// src/features/admin/components/SubscriptionsList/SubscriptionStats.tsx

import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
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
    const { width } = useWindowDimensions();
    const isMobile = width < 768;
    const isSmallMobile = width < 350;

    if (!statistics) return null;

    const statsData = [
        {
            value: statistics.paid_users,
            label: isSmallMobile ? 'Payants' : 'Utilisateurs payants',
            color: colors.success,
        },
        {
            value: statistics.trial_active,
            label: isSmallMobile ? 'Actifs' : 'Période d\'essai active',
            color: colors.warning,
        },
        {
            value: statistics.trial_expired,
            label: isSmallMobile ? 'Expirés' : 'Période d\'essai expirée',
            color: colors.error,
        },
        {
            value: `${statistics.conversion_rate}%`,
            label: isSmallMobile ? 'Conversion' : 'Taux de conversion',
            color: colors.primary,
        },
    ];

    return (
        <View style={[
            styles.statsContainer,
            // 🆕 Styles adaptatifs selon la taille d'écran
            isMobile && styles.mobileStatsContainer,
            { backgroundColor: colors.surface, borderColor: colors.border }
        ]}>
            <Text variant={isMobile ? "body" : "heading3"} color="text" style={styles.statsTitle}>
                {isSmallMobile ? 'Statistiques' : 'Statistiques d\'abonnement'}
            </Text>
            <View style={[
                styles.statsGrid,
                // 🆕 Layout adaptatif
                isMobile && styles.mobileStatsGrid,
                isSmallMobile && styles.smallMobileStatsGrid
            ]}>
                {statsData.map((stat, index) => (
                    <View key={index} style={[
                        styles.statCard,
                        // 🆕 Cartes adaptatives
                        isMobile && styles.mobileStatCard,
                        isSmallMobile && styles.smallMobileStatCard
                    ]}>
                        <Text
                            variant={isMobile ? "heading3" : "heading2"}
                            style={{ color: stat.color }}
                            weight="bold"
                        >
                            {stat.value}
                        </Text>
                        <Text
                            variant="caption"
                            color="textSecondary"
                            style={[
                                styles.statLabel,
                                // 🆕 Texte adaptatif
                                isMobile && styles.mobileStatLabel,
                                isSmallMobile && styles.smallMobileStatLabel
                            ]}
                        >
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
    // 🆕 Version mobile compacte
    mobileStatsContainer: {
        marginHorizontal: spacing.md,
        padding: spacing.md,
        marginBottom: spacing.sm,
    },
    statsTitle: {
        marginBottom: spacing.lg,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
    },
    // 🆕 Grid mobile optimisé
    mobileStatsGrid: {
        gap: spacing.sm,
    },
    // 🆕 Grid pour très petits écrans
    smallMobileStatsGrid: {
        gap: spacing.xs,
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
    // 🆕 Cartes mobiles plus compactes
    mobileStatCard: {
        padding: spacing.sm,
        minWidth: '48%',
        maxWidth: '48%',
    },
    // 🆕 Cartes pour très petits écrans
    smallMobileStatCard: {
        padding: spacing.xs,
        minWidth: '48%',
        maxWidth: '48%',
        gap: spacing.xs,
    },
    statLabel: {
        textAlign: 'center',
    },
    // 🆕 Labels mobiles
    mobileStatLabel: {
        fontSize: 11,
        lineHeight: 14,
    },
    // 🆕 Labels pour très petits écrans
    smallMobileStatLabel: {
        fontSize: 10,
        lineHeight: 12,
    },
});