// AutoBetTab.tsx - Refactorisé avec les composants réutilisables
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    Alert,
    RefreshControl,
} from 'react-native';
import { useTheme } from '@/src/shared/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useFootball } from '@/src/feature/football/hooks/useFootball';

// Import des composants réutilisables
import Button from '@/src/components/atoms/Button';
import Text from '@/src/components/atoms/Text';
import { spacing } from '@/src/styles';

export default function AutoBetTab() {
    const { colors } = useTheme();
    const {
        loading,
        config,
        autoExecutionActive,
        error,
        loadConfig,
        startAutoExecution,
        stopAutoExecution,
    } = useFootball();

    const [localAutoActive, setLocalAutoActive] = useState(false);

    useEffect(() => {
        setLocalAutoActive(autoExecutionActive);
    }, [autoExecutionActive]);

    const onRefresh = useCallback(async () => {
        try {
            await loadConfig();
        } catch (err) {
            console.error('Refresh error:', err);
        }
    }, [loadConfig]);

    const handleToggleAutoExecution = async () => {
        try {
            if (localAutoActive) {
                await stopAutoExecution();
                Alert.alert('Succès', 'Exécution automatique arrêtée');
            } else {
                await startAutoExecution();
                Alert.alert('Succès', 'Exécution automatique démarrée pour 00h00 Madagascar');
            }
        } catch (err) {
            Alert.alert('Erreur', error || 'Une erreur est survenue');
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('mg-MG', {
            style: 'currency',
            currency: 'MGA',
        }).format(amount);
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            refreshControl={
                <RefreshControl
                    refreshing={loading}
                    onRefresh={onRefresh}
                    tintColor={colors.primary}
                    colors={[colors.primary]}
                />
            }
            showsVerticalScrollIndicator={false}
        >
            {/* Configuration Card */}
            {config && (
                <View style={[styles.card, { backgroundColor: colors.surface }]}>
                    <View style={styles.cardHeader}>
                        <Text variant="heading3" color="text">
                            Configuration Actuelle
                        </Text>
                        <View style={[styles.statusBadge, { backgroundColor: colors.success }]}>
                            <Text variant="label" style={{ color: '#ffffff' }}>
                                Actif
                            </Text>
                        </View>
                    </View>

                    <View style={styles.configGrid}>
                        <View style={styles.configItem}>
                            <Text variant="caption" color="textSecondary">
                                Cotes
                            </Text>
                            <Text variant="body" weight="bold" color="text">
                                {config.constraints.min_odds} - {config.constraints.max_odds}
                            </Text>
                        </View>

                        <View style={styles.configItem}>
                            <Text variant="caption" color="textSecondary">
                                Max Matchs
                            </Text>
                            <Text variant="body" weight="bold" color="text">
                                {config.constraints.max_matches}
                            </Text>
                        </View>

                        <View style={styles.configItem}>
                            <Text variant="caption" color="textSecondary">
                                Mise par défaut
                            </Text>
                            <Text variant="body" weight="bold" color="primary">
                                {formatCurrency(config.settings.default_stake)}
                            </Text>
                        </View>

                        <View style={styles.configItem}>
                            <Text variant="caption" color="textSecondary">
                                Gain max
                            </Text>
                            <Text variant="body" weight="bold" color="primary">
                                {formatCurrency(config.constraints.max_payout)}
                            </Text>
                        </View>
                    </View>
                </View>
            )}

            {/* Auto Execution Card */}
            <View style={[styles.card, { backgroundColor: colors.surface }]}>
                <Text variant="heading3" color="text">
                    Exécution Automatique
                </Text>

                <View style={styles.autoSection}>
                    <View style={styles.autoInfo}>
                        <Ionicons
                            name="time-outline"
                            size={24}
                            color={colors.primary}
                        />
                        <View style={styles.autoTextContainer}>
                            <Text variant="body" weight="bold" color="text">
                                Pari automatique à 00h00
                            </Text>
                            <Text variant="caption" color="textSecondary">
                                Fuseau horaire: Madagascar (Indian/Antananarivo)
                            </Text>
                        </View>
                    </View>

                    <View style={styles.statusContainer}>
                        <View style={[
                            styles.statusIndicator,
                            { backgroundColor: localAutoActive ? colors.success : colors.error }
                        ]} />
                        <Text
                            variant="caption"
                            weight="bold"
                            style={{ color: localAutoActive ? colors.success : colors.error }}
                        >
                            {localAutoActive ? 'Actif' : 'Inactif'}
                        </Text>
                    </View>
                </View>

                <Button
                    title={loading
                        ? 'Traitement...'
                        : localAutoActive
                            ? 'Arrêter '
                            : 'Démarrer '
                    }
                    onPress={handleToggleAutoExecution}
                    variant="outline"
                    size="sm"
                    disabled={loading}
                    loading={loading}
                    style={{
                        borderColor: localAutoActive ? colors.error : colors.success,
                        paddingVertical: spacing.xs,
                        paddingHorizontal: spacing.xs,
                    }}
                    textStyle={{
                        color: localAutoActive ? colors.error : colors.success,
                    }}
                />
            </View>

            {/* Information Card */}
            <View style={[styles.card, { backgroundColor: colors.surface }]}>
                <Text variant="heading3" color="text">
                    Informations
                </Text>

                <View style={styles.infoList}>
                    <View style={styles.infoItem}>
                        <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
                        <Text variant="caption" color="textSecondary" style={styles.infoText}>
                            L'exécution automatique se déclenche tous les jours à minuit (Madagascar)
                        </Text>
                    </View>

                    <View style={styles.infoItem}>
                        <Ionicons name="checkmark-circle-outline" size={16} color={colors.success} />
                        <Text variant="caption" color="textSecondary" style={styles.infoText}>
                            Seuls les matchs validés selon la configuration seront pariés
                        </Text>
                    </View>

                    <View style={styles.infoItem}>
                        <Ionicons name="shield-checkmark-outline" size={16} color={colors.primary} />
                        <Text variant="caption" color="textSecondary" style={styles.infoText}>
                            Vous pouvez arrêter l'exécution automatique à tout moment
                        </Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: spacing.lg,
    },
    card: {
        borderRadius: 12,
        padding: spacing.lg,
        marginBottom: spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    statusBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: 20,
    },
    configGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
    },
    configItem: {
        flex: 1,
        minWidth: '45%',
    },
    autoSection: {
        marginBottom: spacing.lg,
    },
    autoInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    autoTextContainer: {
        marginLeft: spacing.sm,
        flex: 1,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    statusIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    infoList: {
        gap: spacing.sm,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.xs,
    },
    infoText: {
        flex: 1,
        lineHeight: 20,
    },
});