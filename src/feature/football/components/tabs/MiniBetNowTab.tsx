// src/feature/football/components/tabs/MiniBetNowTab.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    RefreshControl,
    TextInput,
} from 'react-native';
import { useTheme } from '@/src/shared/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useMini } from '@/src/feature/football/hooks/useMini';
import { MiniMatch } from '@/src/feature/football/types/mini';

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
                <Text style={[styles.matchTitle, { color: colors.text }]}>
                    {match.home_team} vs {match.away_team}
                </Text>
                <View style={[styles.oddsBadge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.oddsText}>{match.odds}</Text>
                </View>
            </View>

            <View style={styles.matchDetails}>
                <View style={styles.betInfo}>
                    <Text style={[styles.betLabel, { color: colors.textSecondary }]}>
                        Pari: {match.bet}
                    </Text>
                    <Text style={[styles.matchTime, { color: colors.textSecondary }]}>
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
                { paddingBottom: 24 }
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
        >
            {/* Configuration Summary */}
            {config && (
                <View style={[styles.card, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>
                        Configuration Mini
                    </Text>

                    <View style={styles.configRow}>
                        <Text style={[styles.configLabel, { color: colors.textSecondary }]}>
                            Plage de cotes: {config.constraints.min_odds} - {config.constraints.max_odds}
                        </Text>
                        <Text style={[styles.configLabel, { color: colors.textSecondary }]}>
                            Système: {config.constraints.max_matches} matchs exactement
                        </Text>
                    </View>
                </View>
            )}

            {/* Matches Summary */}
            {matches && (
                <View style={[styles.card, { backgroundColor: colors.surface }]}>
                    <View style={styles.summaryHeader}>
                        <Text style={[styles.cardTitle, { color: colors.text }]}>
                            Mini - {matches.total_matches} matchs sélectionnés
                        </Text>
                        <View style={[
                            styles.statusBadge,
                            { backgroundColor: matches.validation_status === 'valid_and_ready' ? colors.success : colors.warning }
                        ]}>
                            <Text style={styles.statusText}>
                                {matches.validation_status === 'valid_and_ready' ? 'Prêt' : 'En attente'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.summaryStats}>
                        <View style={styles.statItem}>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                                Cote totale
                            </Text>
                            <Text style={[styles.statValue, { color: colors.primary }]}>
                                {matches.summary.total_odds.toFixed(2)}
                            </Text>
                        </View>

                        <View style={styles.statItem}>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                                Gain estimé
                            </Text>
                            <Text style={[styles.statValue, { color: colors.success }]}>
                                {formatCurrency(matches.summary.estimated_payout)}
                            </Text>
                        </View>
                    </View>
                </View>
            )}

            {/* Bet Configuration */}
            <View style={[styles.card, { backgroundColor: colors.surface }]}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                    Configuration du Pari Mini
                </Text>

                <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>
                        Mise (MGA)
                    </Text>
                    <TextInput
                        style={[
                            styles.input,
                            {
                                backgroundColor: colors.background,
                                borderColor: colors.border || colors.textSecondary,
                                color: colors.text,
                            },
                        ]}
                        value={customStake}
                        onChangeText={setCustomStake}
                        keyboardType="numeric"
                        placeholder="Montant de la mise"
                        placeholderTextColor={colors.textSecondary}
                    />
                    <Text style={[styles.inputHelper, { color: colors.textSecondary }]}>
                        Entre 100 et 50 000 MGA
                    </Text>
                </View>

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
                    <Text style={[styles.checkboxLabel, { color: colors.text }]}>
                        Accepter les changements de cotes
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.executeButton,
                        {
                            backgroundColor: matches?.total_matches === 2 ? colors.success : colors.textSecondary,
                        },
                    ]}
                    onPress={handleExecuteBet}
                    disabled={loading || matches?.total_matches !== 2}
                    activeOpacity={0.8}
                >
                    <Ionicons
                        name="flash"
                        size={20}
                        color="#ffffff"
                    />
                    <Text style={styles.executeButtonText}>
                        {loading ? 'Exécution...' : `Parier maintenant (${matches?.total_matches || 0} matchs)`}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Matches List */}
            {matches?.matches.length === 2 ? (
                <View style={[styles.card, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>
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
                        <Text style={[styles.emptyTitle, { color: colors.text }]}>
                            Sélection en cours
                        </Text>
                        <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
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
        padding: 24,
        paddingTop: 8,
    },
    card: {
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 18,
        fontFamily: 'Poppins_700Bold',
        marginBottom: 16,
    },
    configRow: {
        gap: 8,
    },
    configLabel: {
        fontSize: 14,
        fontFamily: 'Poppins_400Regular',
    },
    summaryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
    },
    statusText: {
        color: '#ffffff',
        fontSize: 12,
        fontFamily: 'Poppins_700Bold',
    },
    summaryStats: {
        flexDirection: 'row',
        gap: 24,
    },
    statItem: {
        flex: 1,
    },
    statLabel: {
        fontSize: 14,
        fontFamily: 'Poppins_400Regular',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 18,
        fontFamily: 'Poppins_700Bold',
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 16,
        fontFamily: 'Poppins_600SemiBold',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        fontFamily: 'Poppins_400Regular',
    },
    inputHelper: {
        fontSize: 12,
        fontFamily: 'Poppins_400Regular',
        marginTop: 4,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        gap: 12,
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
        fontSize: 14,
        fontFamily: 'Poppins_400Regular',
        flex: 1,
    },
    executeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        gap: 8,
    },
    executeButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontFamily: 'Poppins_600SemiBold',
    },
    matchesList: {
        gap: 12,
    },
    matchCard: {
        borderRadius: 8,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    matchHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    matchTitle: {
        fontSize: 14,
        fontFamily: 'Poppins_600SemiBold',
        flex: 1,
    },
    oddsBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    oddsText: {
        color: '#ffffff',
        fontSize: 12,
        fontFamily: 'Poppins_700Bold',
    },
    matchDetails: {
        gap: 4,
    },
    betInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    betLabel: {
        fontSize: 12,
        fontFamily: 'Poppins_400Regular',
    },
    matchTime: {
        fontSize: 12,
        fontFamily: 'Poppins_400Regular',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    emptyTitle: {
        fontSize: 18,
        fontFamily: 'Poppins_600SemiBold',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyDescription: {
        fontSize: 14,
        fontFamily: 'Poppins_400Regular',
        textAlign: 'center',
    },
});