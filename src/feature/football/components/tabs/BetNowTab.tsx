// BetNowTab.tsx - Refactorisé avec les composants réutilisables et Skeleton
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    RefreshControl,
    Keyboard,
} from 'react-native';
import { useTheme } from '@/src/shared/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useFootball } from '@/src/feature/football/hooks/useFootball';
import { FootballMatch } from '@/src/feature/football/types';

// Import des composants réutilisables
import Button from '@/src/components/atoms/Button';
import Input from '@/src/components/atoms/Input';
import Text from '@/src/components/atoms/Text';
import Skeleton from '@/src/components/atoms/Skeleton';
import { spacing } from '@/src/styles';

export default function BetNowTab() {
    const { colors } = useTheme();
    const {
        loading,
        config,
        matches,
        error,
        loadConfig,
        loadMatches,
        executeBet,
    } = useFootball();

    const [customStake, setCustomStake] = useState('');
    const [acceptOddsChange, setAcceptOddsChange] = useState(true);
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        const initializeData = async () => {
            try {
                await Promise.all([loadConfig(), loadMatches()]);
            } catch (err) {
                console.error('Initialize error:', err);
            } finally {
                setInitialLoading(false);
            }
        };

        initializeData();
    }, [loadConfig, loadMatches]);

    useEffect(() => {
        if (config?.settings.default_stake) {
            setCustomStake(config.settings.default_stake.toString());
        }
    }, [config]);

    const onRefresh = useCallback(async () => {
        try {
            await Promise.all([loadConfig(), loadMatches()]);
        } catch (err) {
            console.error('Refresh error:', err);
        }
    }, [loadConfig, loadMatches]);

    const handleExecuteBet = async () => {
        console.log('🚀 handleExecuteBet called');

        // Fermer le clavier d'abord
        Keyboard.dismiss();

        if (!matches?.matches.length) {
            console.log('❌ No matches available');
            Alert.alert('Erreur', 'Aucun match disponible pour le pari');
            return;
        }

        const stake = parseInt(customStake);
        console.log('💰 Stake parsed:', stake);

        if (!stake || stake < 100) {
            console.log('❌ Invalid stake:', stake);
            Alert.alert('Erreur', 'La mise doit être d\'au moins 100 MGA');
            return;
        }

        if (config && stake > 50000) {
            console.log('❌ Stake too high:', stake);
            Alert.alert('Erreur', 'La mise ne peut pas dépasser 50 000 MGA');
            return;
        }

        console.log('✅ All validations passed, showing confirmation alert');

        Alert.alert(
            'Confirmer le pari',
            `Êtes-vous sûr de vouloir parier ${formatCurrency(stake)} sur ${matches.total_matches} matchs ?\n\nGain potentiel: ${formatCurrency(matches.summary.total_odds * stake)}`,
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Confirmer',
                    onPress: async () => {
                        console.log('✅ User confirmed bet, calling executeBet...');
                        try {
                            const result = await executeBet(stake, acceptOddsChange);
                            console.log('🎉 Bet execution successful:', result);
                            Alert.alert(
                                'Pari exécuté !',
                                `Votre pari a été placé avec succès.\n\nID du pari: ${result.bet_id}\nGain potentiel: ${formatCurrency(result.potential_payout)}`
                            );
                            // Recharger les données après exécution
                            await loadMatches();
                        } catch (err) {
                            console.log('💥 Bet execution failed:', err);
                            Alert.alert('Erreur', error || 'Erreur lors de l\'exécution du pari');
                        }
                    },
                },
            ]
        );
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('mg-MG', {
            style: 'currency',
            currency: 'MGA',
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const renderMatch = (match: FootballMatch, index: number) => (
        <View key={index} style={[styles.matchCard, { backgroundColor: colors.background }]}>
            <View style={styles.matchHeader}>
                <Text variant="caption" weight="bold" color="text" style={styles.matchTitle}>
                    {match.home_team} vs {match.away_team}
                </Text>
                <View style={[styles.oddsBadge, { backgroundColor: colors.primary }]}>
                    <Text variant="label" style={{ color: '#ffffff' }}>{match.odds}</Text>
                </View>
            </View>

            <View style={styles.matchDetails}>
                <View style={styles.betInfo}>
                    <Text variant="caption" color="textSecondary">
                        Pari: {match.bet}
                    </Text>
                    <Text variant="caption" color="textSecondary">
                        {formatDate(match.expected_start)}
                    </Text>
                </View>
            </View>
        </View>
    );



    const renderSkeletonContent = () => (
        <>
            {/* Configuration Summary Skeleton - SEULEMENT données API */}
            <View style={styles.firstSection}>
                <Text variant="heading3" color="text">
                    Configuration
                </Text>

                <View style={styles.configRow}>
                    <Text variant="caption" color="textSecondary">
                        Plage de cotes:
                    </Text>
                    <Skeleton width="25%" height={14} animated={false} />
                    <Text variant="caption" color="textSecondary">
                        Max matchs:
                    </Text>
                    <Skeleton width="15%" height={14} animated={false} />
                </View>
            </View>

            {/* Ligne de séparation */}
            <View style={[styles.separator, { backgroundColor: colors.border }]} />

            {/* Matches Summary Skeleton - SEULEMENT données API */}
            <View style={styles.section}>
                <View style={styles.summaryHeader}>
                    <Text variant="heading3" color="text">
                        Résumé (
                    </Text>
                    <Skeleton width="20%" height={24} animated={false} />
                    <Text variant="heading3" color="text">
                        matchs)
                    </Text>
                    <Skeleton width={60} height={28} borderRadius={14} animated={false} />
                </View>

                <View style={styles.summaryStats}>
                    <View style={styles.statItem}>
                        <Text variant="caption" color="textSecondary">
                            Cote totale
                        </Text>
                        <Skeleton width="50%" height={24} animated={false} />
                    </View>

                    <View style={styles.statItem}>
                        <Text variant="caption" color="textSecondary">
                            Gain estimé
                        </Text>
                        <Skeleton width="80%" height={24} animated={false} />
                    </View>
                </View>
            </View>

            {/* Ligne de séparation */}
            <View style={[styles.separator, { backgroundColor: colors.border }]} />

            {/* Bet Configuration - Inputs vides mais visibles */}
            <View style={styles.section}>
                <Text variant="heading3" color="text">
                    Configuration du Pari
                </Text>

                <Input
                    label="Mise (MGA)"
                    value=""
                    onChangeText={() => {}}
                    keyboardType="numeric"
                    placeholder="Montant de la mise"
                    helperText="Entre 100 et 50 000 MGA"
                    editable={false}
                    required
                />

                <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={() => {}}
                    activeOpacity={0.7}
                    disabled={true}
                >
                    <View style={[
                        styles.checkbox,
                        {
                            borderColor: colors.primary,
                            backgroundColor: colors.primary,
                        },
                    ]}>
                        <Ionicons name="checkmark" size={16} color="#ffffff" />
                    </View>
                    <Text variant="caption" color="text" style={styles.checkboxLabel}>
                        Accepter les changements de cotes
                    </Text>
                </TouchableOpacity>

                <Button
                    title="Chargement..."
                    onPress={() => {}}
                    variant="outline"
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

            {/* Matches List Skeleton - Seulement quelques cartes */}
            <View style={styles.section}>
                <Text variant="heading3" color="text">
                    Matchs sélectionnés
                </Text>

                <View style={styles.matchesList}>
                    {Array.from({ length: 2 }).map((_, index) => (
                        <View key={index} style={[styles.matchCard, { backgroundColor: colors.background }]}>
                            <View style={styles.matchHeader}>
                                <Skeleton width="70%" height={14} animated={false} />
                                <Skeleton width={40} height={20} borderRadius={10} animated={false} />
                            </View>

                            <View style={styles.matchDetails}>
                                <View style={styles.betInfo}>
                                    <Text variant="caption" color="textSecondary">
                                        Pari:
                                    </Text>
                                    <Skeleton width="40%" height={12} animated={false} />
                                    <Skeleton width="35%" height={12} animated={false} />
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
            </View>
        </>
    );

    const renderContent = () => (
        <>
            {/* Configuration Summary */}
            {config && (
                <View style={styles.firstSection}>
                    <Text variant="heading3" color="text">
                        Configuration
                    </Text>

                    <View style={styles.configRow}>
                        <Text variant="caption" color="textSecondary">
                            Plage de cotes: {config.constraints.min_odds} - {config.constraints.max_odds}
                        </Text>
                        <Text variant="caption" color="textSecondary">
                            Max matchs: {config.constraints.max_matches}
                        </Text>
                    </View>
                </View>
            )}

            {/* Ligne de séparation */}
            <View style={[styles.separator, { backgroundColor: colors.border }]} />

            {/* Matches Summary */}
            {matches && (
                <View style={styles.section}>
                    <View style={styles.summaryHeader}>
                        <Text variant="heading3" color="text">
                            Résumé ({matches.total_matches} matchs)
                        </Text>
                        <View style={[
                            styles.statusBadge,
                            { backgroundColor: matches.validation_status === 'valid_and_ready' ? colors.success : colors.warning }
                        ]}>
                            <Text variant="label" style={{ color: '#ffffff' }}>
                                {matches.validation_status === 'valid_and_ready' ? 'Prêt' : 'En attente'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.summaryStats}>
                        <View style={styles.statItem}>
                            <Text variant="caption" color="textSecondary">
                                Cote totale
                            </Text>
                            <Text variant="heading3" color="primary">
                                {matches.summary.total_odds.toFixed(2)}
                            </Text>
                        </View>

                        <View style={styles.statItem}>
                            <Text variant="caption" color="textSecondary">
                                Gain estimé
                            </Text>
                            <Text variant="heading3" color="success">
                                {formatCurrency(matches.summary.estimated_payout)}
                            </Text>
                        </View>
                    </View>
                </View>
            )}

            {/* Ligne de séparation */}
            <View style={[styles.separator, { backgroundColor: colors.border }]} />

            {/* Bet Configuration */}
            <View style={styles.section}>
                <Text variant="heading3" color="text">
                    Configuration du Pari
                </Text>

                <Input
                    label="Mise (MGA)"
                    value={customStake}
                    onChangeText={setCustomStake}
                    keyboardType="numeric"
                    placeholder="Montant de la mise"
                    helperText="Entre 100 et 50 000 MGA"
                    returnKeyType="done"
                    onSubmitEditing={Keyboard.dismiss}
                    required
                />

                <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={() => setAcceptOddsChange(!acceptOddsChange)}
                    activeOpacity={0.7}
                >
                    <View style={[
                        styles.checkbox,
                        {
                            borderColor: colors.primary,
                            backgroundColor: acceptOddsChange ? colors.primary : 'transparent',
                        },
                    ]}>
                        {acceptOddsChange && (
                            <Ionicons name="checkmark" size={16} color="#ffffff" />
                        )}
                    </View>
                    <Text variant="caption" color="text" style={styles.checkboxLabel}>
                        Accepter les changements de cotes
                    </Text>
                </TouchableOpacity>

                <Button
                    title={loading ? 'Exécution...' : `Parier maintenant`}
                    onPress={handleExecuteBet}
                    variant="outline"
                    disabled={loading || !matches?.total_matches}
                    loading={loading}
                    style={{
                        borderColor: matches?.total_matches ? colors.success : colors.textSecondary,
                    }}
                    textStyle={{
                        color: matches?.total_matches ? colors.success : colors.textSecondary,
                    }}
                />
            </View>

            {/* Ligne de séparation */}
            <View style={[styles.separator, { backgroundColor: colors.border }]} />

            {/* Matches List */}
            {matches?.matches.length ? (
                <View style={styles.section}>
                    <Text variant="heading3" color="text">
                        Matchs sélectionnés
                    </Text>

                    <View style={styles.matchesList}>
                        {matches.matches.map((match, index) => renderMatch(match, index))}
                    </View>
                </View>
            ) : (
                <View style={styles.section}>
                    <View style={styles.emptyState}>
                        <Ionicons name="football-outline" size={48} color={colors.textSecondary} />
                        <Text variant="heading3" color="text" style={{ marginTop: spacing.md }}>
                            Aucun match disponible
                        </Text>
                        <Text variant="body" color="textSecondary" align="center" style={{ marginTop: spacing.xs }}>
                            Aucun match ne correspond aux critères de configuration actuels
                        </Text>
                    </View>
                </View>
            )}
        </>
    );

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={[
                styles.content,
                { paddingBottom: 50 }
            ]}
            refreshControl={
                <RefreshControl
                    refreshing={loading && !!(config && matches)} // Only show refresh si on a déjà des données
                    onRefresh={onRefresh}
                    tintColor={colors.primary}
                    colors={[colors.primary]}
                />
            }
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
        >
            {initialLoading || (loading && !(config && matches)) ? renderSkeletonContent() : renderContent()}
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
    separator: {
        height: 1,
        marginVertical: spacing.xs,
    },
    configRow: {
        gap: spacing.xs,
    },
    summaryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    statusBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: 20,
    },
    summaryStats: {
        flexDirection: 'row',
        gap: spacing.lg,
    },
    statItem: {
        flex: 1,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.lg,
        gap: spacing.sm,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderWidth: 2,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxLabel: {
        flex: 1,
    },
    matchesList: {
        gap: spacing.sm,
    },
    matchCard: {
        borderRadius: 8,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    matchHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    matchTitle: {
        flex: 1,
    },
    oddsBadge: {
        paddingHorizontal: spacing.xs,
        paddingVertical: spacing.xs,
        borderRadius: 12,
    },
    matchDetails: {
        gap: spacing.xs,
    },
    betInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: spacing.xxl,
    },
});