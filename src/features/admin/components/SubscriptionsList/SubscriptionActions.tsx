// src/features/admin/components/SubscriptionsList/SubscriptionActions.tsx

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/src/shared/context/ThemeContext';
import Button from '@/src/components/atoms/Button';
import { spacing } from '@/src/styles';
import { UserSubscription } from '../SubscriptionsList';

interface SubscriptionActionsProps {
    user: UserSubscription;
    actionLoading: boolean;
    onActivatePaid: (user: UserSubscription) => void;
    onDeactivatePaid: (user: UserSubscription) => void;
    onExtendTrial: (user: UserSubscription) => void;
}

export default function SubscriptionActions({
                                                user,
                                                actionLoading,
                                                onActivatePaid,
                                                onDeactivatePaid,
                                                onExtendTrial
                                            }: SubscriptionActionsProps) {
    const { colors } = useTheme();

    const actions = [];

    // Action pour activer le mode payant
    if (user.available_actions.canActivatePaid) {
        actions.push(
            <Button
                key="activate"
                title="✅ Activer payant"
                onPress={() => onActivatePaid(user)}
                variant="outline"
                size="sm"
                disabled={actionLoading}
                style={{ backgroundColor: colors.success + '10', borderColor: colors.success }}
                textStyle={{ color: colors.success }}
            />
        );
    }

    // Action pour désactiver le mode payant
    if (user.available_actions.canDeactivatePaid) {
        actions.push(
            <Button
                key="deactivate"
                title="❌ Désactiver payant"
                onPress={() => onDeactivatePaid(user)}
                variant="outline"
                size="sm"
                disabled={actionLoading}
                style={{ backgroundColor: colors.error + '10', borderColor: colors.error }}
                textStyle={{ color: colors.error }}
            />
        );
    }

    // Action pour prolonger la période d'essai
    if (user.available_actions.canExtendTrial) {
        actions.push(
            <Button
                key="extend"
                title="⏰ Prolonger"
                onPress={() => onExtendTrial(user)}
                variant="outline"
                size="sm"
                disabled={actionLoading}
                style={{ backgroundColor: colors.warning + '10', borderColor: colors.warning }}
                textStyle={{ color: colors.warning }}
            />
        );
    }

    if (actions.length === 0) {
        return null;
    }

    return (
        <View style={styles.actionsContainer}>
            {actions}
        </View>
    );
}

const styles = StyleSheet.create({
    actionsContainer: {
        flexDirection: 'row',
        gap: spacing.xs,
        flexWrap: 'wrap',
        marginTop: spacing.xs,
    },
});