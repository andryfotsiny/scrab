// src/features/admin/components/SubscriptionsList/SubscriptionDesktopRow.tsx

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/shared/context/ThemeContext';
import Text from '@/src/components/atoms/Text';
import { spacing } from '@/src/styles';
import { UserSubscription } from '../SubscriptionsList';
import SubscriptionBadge from './SubscriptionBadge';
import SubscriptionActions from './SubscriptionActions';

interface SubscriptionDesktopRowProps {
    user: UserSubscription;
    currentUserLogin: string;
    actionLoading: boolean;
    onActivatePaid: (user: UserSubscription) => void;
    onDeactivatePaid: (user: UserSubscription) => void;
    onExtendTrial: (user: UserSubscription) => void;
}

export default function SubscriptionDesktopRow({
                                                   user,
                                                   currentUserLogin,
                                                   actionLoading,
                                                   onActivatePaid,
                                                   onDeactivatePaid,
                                                   onExtendTrial
                                               }: SubscriptionDesktopRowProps) {
    const { colors } = useTheme();
    const isCurrentUser = user.user === currentUserLogin;

    return (
        <View style={[styles.desktopRow, { borderBottomColor: colors.border }]}>
            {/* Utilisateur */}
            <View style={styles.desktopCell}>
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
            </View>

            {/* Statut d'abonnement */}
            <View style={styles.desktopCell}>
                <SubscriptionBadge displayInfo={user.display_info} />
            </View>

            {/* Jours restants */}
            <View style={styles.desktopCell}>
                <Text variant="body" color="text">
                    {user.days_remaining !== null ? `${user.days_remaining} jours` : 'Illimité'}
                </Text>
            </View>

            {/* Accès premium */}
            <View style={styles.desktopCell}>
                <View style={styles.accessInfo}>
                    <Ionicons
                        name={user.can_use_premium_features ? "checkmark-circle" : "close-circle"}
                        size={16}
                        color={user.can_use_premium_features ? colors.success : colors.error}
                    />
                    <Text variant="body" color={user.can_use_premium_features ? "success" : "error"}>
                        {user.can_use_premium_features ? 'Complet' : 'Limité'}
                    </Text>
                </View>
            </View>

            {/* Date création */}
            <View style={styles.desktopCell}>
                <Text variant="body" color="textSecondary">
                    {new Date(user.created_at).toLocaleDateString('fr-FR')}
                </Text>
            </View>

            {/* Actions */}
            <View style={styles.desktopCell}>
                <SubscriptionActions
                    user={user}
                    actionLoading={actionLoading}
                    onActivatePaid={onActivatePaid}
                    onDeactivatePaid={onDeactivatePaid}
                    onExtendTrial={onExtendTrial}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    desktopRow: {
        flexDirection: 'row',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderBottomWidth: 1,
        alignItems: 'center',
        minHeight: 60,
    },
    desktopCell: {
        flex: 1,
        paddingHorizontal: spacing.sm,
        justifyContent: 'center',
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
    accessInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
});