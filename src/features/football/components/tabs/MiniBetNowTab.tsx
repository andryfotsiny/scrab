// MiniBetNowTab.tsx - UPDATED avec React Query
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    Keyboard,
} from 'react-native';
import { useTheme } from '@/src/shared/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useMini } from '@/src/features/football/context/MiniContext';
import { useMiniConfig, useMiniMatches, useMiniUtils } from '@/src/shared/hooks/mini/useMiniQueries';
import { MiniMatch } from '@/src/shared/services/types/mini.type';

import Button from '@/src/components/atoms/Button';
import Input from '@/src/components/atoms/Input';
import Text from '@/src/components/atoms/Text';
import Skeleton from '@/src/components/atoms/Skeleton';
import ConfirmationModal from '@/src/components/molecules/ConfirmationModal';
import SuccessModal from '@/src/components/molecules/SuccessModal';
import { spacing } from '@/src/styles';

export default function MiniBetNowTab() {
    const { colors } = useTheme();

    // ✅ React Query hooks directs + contexte simplifié
    const { data: config, isLoading: configLoading, error: configError } = useMiniConfig();
    const { data: matches, isLoading: matchesLoading, error: matchesError, refetch: refetchMatches } = useMiniMatches();
    const { refreshConfig, refreshMatches } = useMiniUtils();
    const {
        loading: contextLoading,
        error: contextError,
        executeBet,
    } = useMini();

    // ✅ États de chargement dérivés
    const loading = configLoading || matchesLoading || contextLoading;
    const error = configError?.message || matchesError?.message || contextError;
    const initialLoading = (configLoading || matchesLoading) && !(config && matches);

    const [customStake, setCustomStake] = useState('');
    const [acceptOddsChange, setAcceptOddsChange] = useState(true);

    // Modal states
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [modalData, setModalData] = useState({
        betId: '',
        potentialPayout: '',
        errorMessage: '',
    });

    useEffect(() => {
        if (config?.settings.default_stake) {
            setCustomStake(config.settings.default_stake.toString());
        }
    }, [config]);

    // ✅ React Query gère automatiquement le refresh
    const onRefresh = useCallback(async () => {
        try {
            await Promise.all([refreshConfig(), refreshMatches()]);
            console.log('🔄 MiniBetNowTab: Data refreshed via React Query');
        } catch (err) {
            console.error('Refresh error:', err);
        }
    }, [refreshConfig, refreshMatches]);

    const handleExecuteBet = async () => {
        // Fermer le clavier d'abord
        Keyboard.dismiss();

        if (!matches?.matches.length) {
            setModalData({ ...modalData, errorMessage: 'Aucun match disponible pour le pari' });
            setShowErrorModal(true);
            return;
        }

        const stake = parseInt(customStake);
        if (!stake || stake < 100) {
            setModalData({ ...modalData, errorMessage: 'La mise doit être d\'au moins 100 MGA' });
            setShowErrorModal(true);
            return;
        }

        if (config && stake > 50000) {
            setModalData({ ...modalData, errorMessage: 'La mise ne peut pas dépasser 50 000 MGA' });
            setShowErrorModal(true);
            return;
        }

        setShowConfirmModal(true);
    };

    const handleConfirmBet = async () => {
        setShowConfirmModal(false);

        try {
            const stake = parseInt(customStake);
            const result = await executeBet(stake, acceptOddsChange);

            setModalData({
                betId: result.bet_id.toString(),
                potentialPayout: formatCurrency(result.potential_payout),
                errorMessage: '',
            });
            setShowSuccessModal(true);

            // ✅ React Query va automatiquement invalider et recharger les données nécessaires
            await refetchMatches();
        } catch (err) {
            setModalData({
                ...modalData,
                errorMessage: error || 'Erreur lors de l\'exécution du pari'
            });
            setShowErrorModal(true);
        }
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

    const renderSkeletonContent = () => (
        <>
            {/* Configuration Summary Skeleton - SEULEMENT données API */}
            <View style={styles.firstSection}>
                <Text variant="heading3" color="text">
                    Configuration Mini
                </Text>

                <View style={styles.configRow}>
                    <Text variant="caption" color="textSecondary">
                        Plage de cotes:
                    </Text>
                    <Skeleton width="25%" height={14} animated={false} />
                    <Text variant="caption" color="textSecondary">
                        Système:
                    </Text>
                    <Skeleton width="35%" height={14} animated={false} />
                </View>
            </View>

            {/* Ligne de séparation */}
            <View style={[styles.separator, { backgroundColor: colors.border }]} />

            {/* Matches Summary Skeleton - SEULEMENT données API */}
            <View style={styles.section}>
                <View style={styles.summaryHeader}>
                    <Text variant="heading3" color="text">
                        Mini
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

            {/* Bet Configuration - Input vide mais visible */}
            <View style={styles.section}>
                <Text variant="heading3" color="text">
                    Configuration du Pari Mini
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

            {/* Matches List Skeleton */}
            <View style={styles.section}>
                <View style={styles.emptyState}>
                    <Ionicons name="flash-outline" size={48} color={colors.textSecondary} />
                    <Text variant="heading3" color="text" style={{ marginTop: spacing.md }}>
                        Sélection en cours
                    </Text>
                    <Text variant="body" color="textSecondary" align="center" style={{ marginTop: spacing.xs }}>
                        Le système Mini sélectionne automatiquement 2 matchs optimaux via React Query
                    </Text>
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

            {/* Ligne de séparation */}
            <View style={[styles.separator, { backgroundColor: colors.border }]} />

            {/* Matches Summary */}
            {matches && (
                <View style={styles.section}>
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

            {/* Ligne de séparation */}
            <View style={[styles.separator, { backgroundColor: colors.border }]} />

            {/* Bet Configuration */}
            <View style={styles.section}>
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
                    title={loading ? 'Exécution...' : `Parier maintenant `}
                    onPress={handleExecuteBet}
                    variant="outline"
                    disabled={loading || matches?.total_matches !== 2}
                    loading={loading}
                    style={{
                        borderColor: matches?.total_matches === 2 ? colors.success : colors.textSecondary,
                    }}
                    textStyle={{
                        color: matches?.total_matches === 2 ? colors.success : colors.textSecondary,
                    }}
                />
            </View>

            {/* Ligne de séparation */}
            <View style={[styles.separator, { backgroundColor: colors.border }]} />

            {/* Matches List */}
            {matches?.matches.length === 2 ? (
                <View style={styles.section}>
                    <Text variant="heading3" color="text">
                        2 Matchs Mini sélectionnés
                    </Text>

                    <View style={styles.matchesList}>
                        {matches.matches.map((match: MiniMatch, index: number) => renderMatch(match, index))}
                    </View>
                </View>
            ) : (
                <View style={styles.section}>
                    <View style={styles.emptyState}>
                        <Ionicons name="flash-outline" size={48} color={colors.textSecondary} />
                        <Text variant="heading3" color="text" style={{ marginTop: spacing.md }}>
                            Sélection en cours
                        </Text>
                        <Text variant="body" color="textSecondary" align="center" style={{ marginTop: spacing.xs }}>
                            Le système Mini sélectionne automatiquement 2 matchs optimaux via React Query
                        </Text>
                    </View>
                </View>
            )}
        </>
    );

    return (
        <>
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
                {initialLoading ? renderSkeletonContent() : renderContent()}
            </ScrollView>

            {/* Modals */}
            <ConfirmationModal
                visible={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                title="Confirmer le pari Mini "
                message={`Êtes-vous sûr de vouloir parier ${formatCurrency(parseInt(customStake) || 0)} sur ${matches?.total_matches || 0} matchs ?\n\nGain potentiel: ${formatCurrency((matches?.summary.total_odds || 0) * (parseInt(customStake) || 0))}\n\nLe cache sera automatiquement mis à jour.`}
                confirmText="Confirmer"
                cancelText="Annuler"
                onConfirm={handleConfirmBet}
                type="warning"
                loading={loading}
                confirmButtonVariant="primary"
            />

            <SuccessModal
                visible={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                title="Pari Mini exécuté ! "
                betId={modalData.betId}
                potentialPayout={modalData.potentialPayout}
                customMessage="Votre pari mini a été placé avec succès. React Query a automatiquement mis à jour le cache."
            />

            <ConfirmationModal
                visible={showErrorModal}
                onClose={() => setShowErrorModal(false)}
                title="Erreur"
                message={modalData.errorMessage}
                confirmText="Compris"
                onConfirm={() => setShowErrorModal(false)}
                type="error"
                confirmButtonVariant="outline"
            />
        </>
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