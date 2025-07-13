// src/features/admin/components/SubscriptionsList/SubscriptionMobileCard.tsx

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/shared/context/ThemeContext';
import Text from '@/src/components/atoms/Text';
import { spacing } from '@/src/styles';
import { UserSubscription } from '../SubscriptionsList';
import SubscriptionBadge from './SubscriptionBadge';
import SubscriptionActions from './SubscriptionActions';

interface SubscriptionMobileCardProps {
    user: UserSubscription;
    currentUserLogin: string;
    actionLoading: boolean;
    onActivatePaid: (user: UserSubscription) => void;
    onDeactivatePaid: (user: UserSubscription) => void;
    onExtendTrial: (user: UserSubscription) => void;
}

export default function SubscriptionMobileCard({
                                                   user,
                                                   currentUserLogin,
                                                   actionLoading,
                                                   onActivatePaid,
                                                   onDeactivatePaid,
                                                   onExtendTrial
                                               }: SubscriptionMobileCardProps) {
    const { colors } = useTheme();
    const isCurrentUser = user.user === currentUserLogin;

    return (
        <View style={[
            styles.mobileCard,
            { backgroundColor: colors.surface, borderColor: colors.border }
        ]}>
            <View style={styles.cardHeader}>
                <View style={styles.userInfo}>
                    <Text variant="body" weight="bold" color="text">
                        {user.user}
                    </Text>
                    {isCurrentUser && (
                        <View style={[styles.currentUserBadge, { backgroundColor: colors.primary }]}>
                            <Text style={styles.currentUserText}>Vous</Text>
                        </View>
                    )}
                </View>
                <SubscriptionBadge displayInfo={user.display_info} />
            </View>

            <View style={styles.cardContent}>
                <Text variant="caption" color="textSecondary" style={styles.description}>
                    {user.display_info.description}
                </Text>

                <View style={styles.detailsRow}>
                    <View style={styles.detailItem}>
                        <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                        <Text variant="caption" color="textSecondary">
                            {user.days_remaining !== null ? `${user.days_remaining} jours restants` : 'Accès illimité'}
                        </Text>
                    </View>

                    <View style={styles.detailItem}>
                        <Ionicons
                            name={user.can_use_premium_features ? "checkmark-circle" : "close-circle"}
                            size={14}
                            color={user.can_use_premium_features ? colors.success : colors.error}
                        />
                        <Text variant="caption" color="textSecondary">
                            Accès {user.can_use_premium_features ? 'complet' : 'limité'}
                        </Text>
                    </View>
                </View>

                <View style={styles.detailItem}>
                    <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                    <Text variant="caption" color="textSecondary">
                        Créé le {new Date(user.created_at).toLocaleDateString('fr-FR')}
                    </Text>
                </View>
            </View>

            <SubscriptionActions
                user={user}
                actionLoading={actionLoading}
                onActivatePaid={onActivatePaid}
                onDeactivatePaid={onDeactivatePaid}
                onExtendTrial={onExtendTrial}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    mobileCard: {
        padding: spacing.lg,
        borderRadius: 12,
        borderWidth: 1,
        gap: spacing.md,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardContent: {
        gap: spacing.sm,
    },
    description: {
        lineHeight: 18,
    },
    detailsRow: {
        flexDirection: 'row',
        gap: spacing.lg,
        flexWrap: 'wrap',
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    currentUserBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: 8,
    },
    currentUserText: {
        color: '#ffffff',
        fontSize: 10,
        fontFamily: 'Poppins_700Bold',
    },
});