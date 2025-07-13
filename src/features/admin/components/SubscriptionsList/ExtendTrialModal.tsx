// src/features/admin/components/SubscriptionsList/ExtendTrialModal.tsx

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Input from '@/src/components/atoms/Input';
import ConfirmationModal from '@/src/components/molecules/ConfirmationModal';
import { spacing } from '@/src/styles';
import { UserSubscription } from '../SubscriptionsList';

interface ExtendTrialModalProps {
    visible: boolean;
    user: UserSubscription | null;
    days: string;
    notes: string;
    loading: boolean;
    onClose: () => void;
    onDaysChange: (value: string) => void;
    onNotesChange: (value: string) => void;
    onConfirm: () => void;
}

export default function ExtendTrialModal({
                                             visible,
                                             user,
                                             days,
                                             notes,
                                             loading,
                                             onClose,
                                             onDaysChange,
                                             onNotesChange,
                                             onConfirm
                                         }: ExtendTrialModalProps) {
    const customContent = (
        <View style={styles.extendTrialForm}>
            <Input
                label="Nombre de jours à ajouter"
                value={days}
                onChangeText={onDaysChange}
                keyboardType="numeric"
                placeholder="7"
                required
            />
            <Input
                label="Notes (optionnel)"
                value={notes}
                onChangeText={onNotesChange}
                placeholder="Raison de la prolongation..."
                multiline
                numberOfLines={3}
            />
        </View>
    );

    return (
        <ConfirmationModal
            visible={visible}
            onClose={onClose}
            title="Prolonger la période gratuite"
            message={`Combien de jours voulez-vous ajouter à la période gratuite de l'utilisateur ${user?.user} ?`}
            confirmText="Prolonger"
            cancelText="Annuler"
            onConfirm={onConfirm}
            type="info"
            loading={loading}
            customContent={customContent}
        />
    );
}

const styles = StyleSheet.create({
    extendTrialForm: {
        gap: spacing.md,
        marginTop: spacing.md,
    },
});