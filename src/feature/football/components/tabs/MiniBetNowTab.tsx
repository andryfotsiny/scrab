// MiniBetNowTab.tsx - Refactorisé avec les composants réutilisables
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
import { useMini } from '@/src/feature/football/hooks/useMini';
import { MiniMatch } from '@/src/feature/football/types/mini';

// Import des composants réutilisables
import Button from '@/src/components/atoms/Button';
import Input from '@/src/components/atoms/Input';
import Text from '@/src/components/atoms/Text';
import { spacing } from '@/src/styles';

export default function MiniBetNowTab() {
    const { colors } = useTheme();
    const {
        loading,
        config,
        matches,
        error,
        loadConfig,
        loadMatches,
        executeBet,
    } = useMini();

    const [customStake, setCustomStake] = useState('');
    const [acceptOddsChange, setAcceptOddsChange] = useState(true);

    useEffect(() => {
        loadConfig().catch(console.error);
        loadMatches().catch(console.error);
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
        // Fermer le clavier d'abord
        Keyboard.dismiss();

        if (!matches?.matches.length) {
            Alert.alert('Erreur', 'Aucun match disponible pour le pari');
            return;
        }

        const stake = parseInt(customStake);
        if (!stake || stake < 100) {
            Alert.alert('Erreur', 'La mise doit être d\'au moins 100 MGA');
            return;
        }

        if (config && stake > 50000) {
            Alert.alert('Erreur', 'La mise ne peut pas dépasser 50 000 MGA');
            return;
        }

        Alert.alert(
            'Confirmer le pari Mini',
            `Êtes-vous sûr de vouloir parier ${formatCurrency(stake)} sur ${matches.total_matches} matchs ?\n\nGain potentiel: ${formatCurrency(matches.summary.total_odds * stake)}`,
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Confirmer',
                    onPress: async () => {
                        try {
                            const result = await executeBet(stake, acceptOddsChange);
                            Alert.alert(
                                'Pari Mini exécuté !',
                                `Votre pari mini a été placé avec succès.\n\nID du pari: ${result.bet_id}\nGain potentiel: ${formatCurrency(result.potential_payout)}`
                            );
                            // Recharger les données après exécution
                            await loadMatches();
                        } catch (err) {
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

    const renderMatch = (match: MiniMatch, index: number) => (
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

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={[
                styles.content,
                { paddingBottom: 50 }
            ]}
            refreshControl={
                <RefreshControl
                    refreshing={loading}
                    onRefresh={onRefresh}
                    tintColor={colors.primary}
                    colors={[colors.primary]}
                />
            }
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
        >
            {/* Configuration Summary */}
            {config && (
                <View style={[styles.card, { backgroundColor: colors.surface }]}>
                    <Text variant="heading3" color="text">
                        Configuration Mini
                    </Text>

                    <View style={styles.configRow}>
                        <Text variant="caption" color="textSecondary">
                            Plage de cotes: {config.constraints.min_odds} - {config.constraints.max_odds}
                        </Text>
                        <Text variant="caption" color="textSecondary">
                            Système: {config.constraints.max_matches} matchs exactement
                        </Text>
                    </View>
                </View>
            )}

            {/* Matches Summary */}
            {matches && (
                <View style={[styles.card, { backgroundColor: colors.surface }]}>
                    <View style={styles.summaryHeader}>
                        <Text variant="heading3" color="text">
                            Mini - {matches.total_matches} matchs sélectionnés
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

            {/* Bet Configuration */}
            <View style={[styles.card, { backgroundColor: colors.surface }]}>
                <Text variant="heading3" color="text">
                    Configuration du Pari Mini
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
                    title={loading ? 'Exécution...' : `Parier maintenant (${matches?.total_matches || 0} matchs)`}
                    onPress={handleExecuteBet}
                    variant="primary"
                    disabled={loading || matches?.total_matches !== 2}
                    loading={loading}
                    style={{
                        backgroundColor: matches?.total_matches === 2 ? colors.success : colors.textSecondary,
                    }}
                />
            </View>

            {/* Matches List */}
            {matches?.matches.length === 2 ? (
                <View style={[styles.card, { backgroundColor: colors.surface }]}>
                    <Text variant="heading3" color="text">
                        2 Matchs Mini sélectionnés
                    </Text>

                    <View style={styles.matchesList}>
                        {matches.matches.map((match, index) => renderMatch(match, index))}
                    </View>
                </View>
            ) : (
                <View style={[styles.card, { backgroundColor: colors.surface }]}>
                    <View style={styles.emptyState}>
                        <Ionicons name="flash-outline" size={48} color={colors.textSecondary} />
                        <Text variant="heading3" color="text" style={{ marginTop: spacing.md }}>
                            Sélection en cours
                        </Text>
                        <Text variant="body" color="textSecondary" align="center" style={{ marginTop: spacing.xs }}>
                            Le système Mini sélectionne automatiquement 2 matchs optimaux
                        </Text>
                    </View>
                </View>
            )}
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