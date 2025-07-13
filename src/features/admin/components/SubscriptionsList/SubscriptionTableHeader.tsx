// src/features/admin/components/SubscriptionsList/SubscriptionTableHeader.tsx

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/src/shared/context/ThemeContext';
import Text from '@/src/components/atoms/Text';
import { spacing } from '@/src/styles';

export default function SubscriptionTableHeader() {
    const { colors } = useTheme();

    const headers = [
        'Utilisateur',
        'Statut',
        'Jours restants',
        'Accès',
        'Date création',
        'Actions'
    ];

    return (
        <View style={[
            styles.desktopTableHeader,
            { backgroundColor: colors.surface, borderBottomColor: colors.border }
        ]}>
            {headers.map((header, index) => (
                <View key={index} style={styles.desktopHeaderCell}>
                    <Text variant="body" weight="bold" color="text">
                        {header}
                    </Text>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    desktopTableHeader: {
        flexDirection: 'row',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderBottomWidth: 2,
    },
    desktopHeaderCell: {
        flex: 1,
        paddingHorizontal: spacing.sm,
    },
});