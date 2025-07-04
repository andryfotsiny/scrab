// MiniAutoBetTab.tsx - Refactorisé avec les composants réutilisables et Skeleton
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
import { useMini } from '@/src/feature/football/hooks/useMini';

// Import des composants réutilisables
import Button from '@/src/components/atoms/Button';
import Text from '@/src/components/atoms/Text';
import Skeleton from '@/src/components/atoms/Skeleton';
import { spacing } from '@/src/styles';

export default function MiniAutoBetTab() {
    const { colors } = useTheme();
    const {
        loading,
        config,
        miniAutoExecutionActive,
        error,
        loadConfig,
        startAutoExecution,
        stopAutoExecution,
    } = useMini();

    const [localAutoActive, setLocalAutoActive] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        setLocalAutoActive(miniAutoExecutionActive);
    }, [miniAutoExecutionActive]);

    useEffect(() => {
        const initializeData = async () => {
            try {
                await loadConfig();
            } catch (err) {
                console.error('Initialize error:', err);
            } finally {
                setInitialLoading(false);
            }
        };

        initializeData();
    }, [loadConfig]);

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
                Alert.alert('Succès', 'Exécution automatique Mini arrêtée');
            } else {
                await startAutoExecution();
                Alert.alert('Succès', 'Exécution automatique Mini démarrée pour 00h00 Madagascar');
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

    const renderSkeletonContent = () => (
        <>
            {/* Configuration Section Skeleton - SEULEMENT données API */}
            <View style={styles.firstSection}>
                <View style={styles.sectionHeader}>
                    <Text variant="heading3" color="text">
                        Configuration Mini (2 matchs)
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
                        <Skeleton width="70%" height={18} animated={false} />
                    </View>

                    <View style={styles.configItem}>
                        <Text variant="caption" color="textSecondary">
                            Nombre de matchs
                        </Text>
                        <Skeleton width="40%" height={18} animated={false} />
                    </View>

                    <View style={styles.configItem}>
                        <Text variant="caption" color="textSecondary">
                            Mise par défaut
                        </Text>
                        <Skeleton width="80%" height={18} animated={false} />
                    </View>

                    <View style={styles.configItem}>
                        <Text variant="caption" color="textSecondary">
                            Gain max
                        </Text>
                        <Skeleton width="85%" height={18} animated={false} />
                    </View>
                </View>
            </View>

            {/* Auto Execution Section - Textes statiques + état API */}
            <View style={styles.section}>
                <Text variant="heading3" color="text">
                    Exécution Automatique Mini
                </Text>

                <View style={styles.autoSection}>
                    <View style={styles.autoInfo}>
                        <Ionicons
                            name="flash-outline"
                            size={24}
                            color={colors.primary}
                        />
                        <View style={styles.autoTextContainer}>
                            <Text variant="body" weight="bold" color="text">
                                Pari automatique mini à 00h00
                            </Text>
                            <Text variant="caption" color="textSecondary">
                                Système: 2 matchs sélectionnés automatiquement
                            </Text>
                        </View>
                    </View>

                    <View style={styles.statusContainer}>
                        <Skeleton width={12} height={12} borderRadius={6} animated={false} />
                        <Skeleton width="30%" height={14} animated={false} />
                    </View>
                </View>

                <Button
                    title="Chargement..."
                    onPress={() => {}}
                    variant="outline"
                    size="sm"
                    disabled={true}
                    style={{
                        borderColor: colors.textSecondary,
                    }}
                    textStyle={{
                        color: colors.textSecondary,
                    }}
                />
            </View>

            {/* Ligne de séparation */}
            <View style={[styles.separator, { backgroundColor: colors.border }]} />

            {/* Information Section - Textes statiques, PAS de skeleton */}
            <View style={styles.section}>
                <Text variant="heading3" color="text">
                    Informations Mini
                </Text>

                <View style={styles.infoList}>
                    <View style={styles.infoItem}>
                        <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
                        <Text variant="caption" color="textSecondary" style={styles.infoText}>
                            Le système Mini sélectionne automatiquement exactement 2 matchs
                        </Text>
                    </View>

                    <View style={styles.infoItem}>
                        <Ionicons name="checkmark-circle-outline" size={16} color={colors.success} />
                        <Text variant="caption" color="textSecondary" style={styles.infoText}>
                            Cotes optimisées pour des gains réguliers avec risque réduit
                        </Text>
                    </View>

                    <View style={styles.infoItem}>
                        <Ionicons name="shield-checkmark-outline" size={16} color={colors.primary} />
                        <Text variant="caption" color="textSecondary" style={styles.infoText}>
                            Exécution quotidienne à minuit (Madagascar)
                        </Text>
                    </View>
                </View>
            </View>
        </>
    );

    const renderContent = () => (
        <>
            {/* Configuration Section */}
            {config && (
                <View style={styles.firstSection}>
                    <View style={styles.sectionHeader}>
                        <Text variant="heading3" color="text">
                            Configuration Mini (2 matchs)
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
                                Nombre de matchs
                            </Text>
                            <Text variant="body" weight="bold" color="text">
                                {config.constraints.max_matches} matchs
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

            {/* Auto Execution Section */}
            <View style={styles.section}>
                <Text variant="heading3" color="text">
                    Exécution Automatique Mini
                </Text>

                <View style={styles.autoSection}>
                    <View style={styles.autoInfo}>
                        <Ionicons
                            name="flash-outline"
                            size={24}
                            color={colors.primary}
                        />
                        <View style={styles.autoTextContainer}>
                            <Text variant="body" weight="bold" color="text">
                                Pari automatique mini à 00h00
                            </Text>
                            <Text variant="caption" color="textSecondary">
                                Système: 2 matchs sélectionnés automatiquement
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
                    }}
                    textStyle={{
                        color: localAutoActive ? colors.error : colors.success,
                    }}
                />
            </View>

            {/* Ligne de séparation */}
            <View style={[styles.separator, { backgroundColor: colors.border }]} />

            {/* Information Section */}
            <View style={styles.section}>
                <Text variant="heading3" color="text">
                    Informations Mini
                </Text>

                <View style={styles.infoList}>
                    <View style={styles.infoItem}>
                        <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
                        <Text variant="caption" color="textSecondary" style={styles.infoText}>
                            Le système Mini sélectionne automatiquement exactement 2 matchs
                        </Text>
                    </View>

                    <View style={styles.infoItem}>
                        <Ionicons name="checkmark-circle-outline" size={16} color={colors.success} />
                        <Text variant="caption" color="textSecondary" style={styles.infoText}>
                            Cotes optimisées pour des gains réguliers avec risque réduit
                        </Text>
                    </View>

                    <View style={styles.infoItem}>
                        <Ionicons name="shield-checkmark-outline" size={16} color={colors.primary} />
                        <Text variant="caption" color="textSecondary" style={styles.infoText}>
                            Exécution quotidienne à minuit (Madagascar)
                        </Text>
                    </View>
                </View>
            </View>
        </>
    );

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            refreshControl={
                <RefreshControl
                    refreshing={loading && !!config} // Only show refresh si on a déjà des données
                    onRefresh={onRefresh}
                    tintColor={colors.primary}
                    colors={[colors.primary]}
                />
            }
            showsVerticalScrollIndicator={false}
        >
            {initialLoading || (loading && !config) ? renderSkeletonContent() : renderContent()}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: spacing.lg,
        paddingTop: spacing.xs,
    },
    firstSection: {
        paddingBottom: spacing.lg,
    },
    section: {
        paddingVertical: spacing.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    separator: {
        height: 1,
        marginVertical: spacing.xs,
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