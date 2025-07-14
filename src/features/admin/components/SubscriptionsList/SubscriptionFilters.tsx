// src/features/admin/components/SubscriptionsList/SubscriptionFilters.tsx

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/src/shared/context/ThemeContext';
import Text from '@/src/components/atoms/Text';
import Input from '@/src/components/atoms/Input';
import { spacing } from '@/src/styles';

interface SubscriptionFiltersProps {
    searchQuery: string;
    onSearchQueryChange: (query: string) => void;
    statusFilter: 'all' | 'payant' | 'gratuit' | 'expire' | 'non_demarre';
    onStatusFilterChange: (filter: 'all' | 'payant' | 'gratuit' | 'expire' | 'non_demarre') => void;
    screenSize: {
        width: number;
        isTablet: boolean;
        isDesktop: boolean;
        isMobile: boolean;
    };
}

export default function SubscriptionFilters({
                                                searchQuery,
                                                onSearchQueryChange,
                                                statusFilter,
                                                onStatusFilterChange,
                                                screenSize
                                            }: SubscriptionFiltersProps) {
    const { colors } = useTheme();

    const filterOptions = [
        { key: 'all', label: 'Tous', color: colors.textSecondary },
        { key: 'payant', label: 'Payant', color: colors.success },
        { key: 'gratuit', label: 'Gratuit actif', color: colors.warning },
        { key: 'expire', label: 'Expiré', color: colors.error },
        { key: 'non_demarre', label: 'Non démarré', color: colors.primary },
    ] as const;

    return (
        <View style={[
            styles.filtersContainer,
            screenSize.isDesktop && styles.desktopFiltersContainer,
            // 🆕 Réduction du padding sur mobile
            screenSize.isMobile && styles.mobileFiltersContainer,
            { borderBottomColor: colors.border }
        ]}>
            <View style={[
                styles.filtersRow,
                screenSize.isDesktop && styles.desktopFiltersRow
            ]}>
                <Input
                    placeholder="Rechercher par numéro..."
                    value={searchQuery}
                    onChangeText={onSearchQueryChange}
                    containerStyle={[
                        styles.searchInput,
                        screenSize.isDesktop && styles.desktopSearchInput
                    ]}
                />

                <View style={styles.filterSection}>
                    <Text variant="caption" color="textSecondary" style={styles.filterLabel}>
                        Statut :
                    </Text>
                    <View style={[
                        styles.statusFilters,
                        // 🆕 Layout adaptatif pour mobile
                        screenSize.isMobile && styles.mobileStatusFilters
                    ]}>
                        {filterOptions.map(({ key, label, color }) => (
                            <TouchableOpacity
                                key={key}
                                style={[
                                    styles.filterChip,
                                    // 🆕 Taille adaptative
                                    screenSize.isMobile && styles.mobileFilterChip,
                                    {
                                        backgroundColor: statusFilter === key ? color + '20' : colors.surface,
                                        borderColor: statusFilter === key ? color : colors.border,
                                    }
                                ]}
                                onPress={() => onStatusFilterChange(key)}
                            >
                                <Text
                                    variant="caption"
                                    style={[
                                        {
                                            color: statusFilter === key ? color : colors.text,
                                            fontWeight: statusFilter === key ? 'bold' : 'normal'
                                        },
                                        // 🆕 Texte plus petit sur mobile
                                        screenSize.isMobile && styles.mobileFilterText
                                    ]}
                                >
                                    {/* 🆕 Labels raccourcis pour très petits écrans */}
                                    {screenSize.width < 350 ? getShortLabel(key) : label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>
        </View>
    );
}

// 🆕 Fonction helper pour les labels courts
const getShortLabel = (key: string) => {
    switch (key) {
        case 'all':
            return 'Tous';
        case 'payant':
            return 'Payant';
        case 'gratuit':
            return 'Gratuit';
        case 'expire':
            return 'Expiré';
        case 'non_demarre':
            return 'Nouveau';
        default:
            return key;
    }
};

const styles = StyleSheet.create({
    filtersContainer: {
        padding: spacing.lg,
        gap: spacing.md,
    },
    // 🆕 Version mobile compacte
    mobileFiltersContainer: {
        padding: spacing.md,
        gap: spacing.sm,
    },
    filtersRow: {
        gap: spacing.md,
    },
    searchInput: {
        marginBottom: spacing.sm,
    },
    filterSection: {
        gap: spacing.xs,
    },
    filterLabel: {
        marginBottom: spacing.xs,
    },
    statusFilters: {
        flexDirection: 'row',
        gap: spacing.sm,
        flexWrap: 'wrap',
    },
    // 🆕 Layout mobile optimisé
    mobileStatusFilters: {
        gap: spacing.xs,
        justifyContent: 'space-between',
    },
    filterChip: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: 16,
        borderWidth: 1,
        minHeight: 32, // 🆕 Hauteur minimum pour le touch
    },
    // 🆕 Version mobile plus compacte
    mobileFilterChip: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: 12,
        flex: 1,
        alignItems: 'center',
        minWidth: 60,
    },
    // 🆕 Texte mobile plus petit
    mobileFilterText: {
        fontSize: 11,
    },
    // Styles desktop
    desktopFiltersContainer: {
        borderBottomWidth: 1,
    },
    desktopFiltersRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: spacing.lg,
    },
    desktopSearchInput: {
        flex: 1,
        maxWidth: 300,
        marginBottom: 0,
        marginRight: spacing.lg,
    },
});