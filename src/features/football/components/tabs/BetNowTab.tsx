// BetNowTab.tsx - VERSION RESPONSIVE
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    Keyboard,
    Dimensions,
    FlatList,
} from 'react-native';
import { useTheme } from '@/src/shared/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useFootball } from '@/src/features/football/context/FootballContext';
import { useGroloConfig, useGroloMatches, useGroloUtils } from '@/src/shared/hooks/grolo/useGroloQueries';
import { FootballMatch } from '../../../../shared/services/types/grolo.type';

import Button from '@/src/components/atoms/Button';
import Input from '@/src/components/atoms/Input';
import Text from '@/src/components/atoms/Text';
import Skeleton from '@/src/components/atoms/Skeleton';
import ConfirmationModal from '@/src/components/molecules/ConfirmationModal';
import SuccessModal from '@/src/components/molecules/SuccessModal';
import { spacing } from '@/src/styles';

// Hook pour la responsivité
const useScreenSize = () => {
    const [screenSize, setScreenSize] = useState(() => {
        const { width } = Dimensions.get('window');
        return {
            width,
            isTablet: width >= 768,
            isDesktop: width >= 1024,
            isMobile: width < 768,
        };
    });

    useEffect(() => {
        const subscription = Dimensions.addEventListener('change', ({ window }) => {
            setScreenSize({
                width: window.width,
                isTablet: window.width >= 768,
                isDesktop: window.width >= 1024,
                isMobile: window.width < 768,
            });
        });

        return () => subscription?.remove();
    }, []);

    return screenSize;
};

export default function BetNowTab() {
    const { colors } = useTheme();
    const screenSize = useScreenSize();

    // React Query hooks directs + contexte simplifié
    const { data: config, isLoading: configLoading, error: configError } = useGroloConfig();
    const { data: matches, isLoading: matchesLoading, error: matchesError, refetch: refetchMatches } = useGroloMatches();
    const { refreshConfig, refreshMatches } = useGroloUtils();
    const {
        loading: contextLoading,
        error: contextError,
        executeBet,
    } = useFootball();

    // États de chargement dérivés
    const loading = configLoading || matchesLoading || contextLoading;
    const error = configError?.message || matchesError?.message || contextError;
    const initialLoading = (configLoading || matchesLoading) && !(config && matches);

    const [customStake, setCustomStake] = useState('');
    const [acceptOddsChange] = useState(true);

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

    // React Query gère automatiquement le refresh
    const onRefresh = useCallback(async () => {
        try {
            await Promise.all([refreshConfig(), refreshMatches()]);
            console.log('🔄 BetNowTab: Data refreshed via React Query');
        } catch (err) {
            console.error('Refresh error:', err);
        }
    }, [refreshConfig, refreshMatches]);

    const handleExecuteBet = async () => {
        console.log('🚀 handleExecuteBet called');
        Keyboard.dismiss();

        if (!matches?.matches.length) {
            console.log('❌ No matches available');
            setModalData({ ...modalData, errorMessage: 'Aucun match disponible pour le pari' });
            setShowErrorModal(true);
            return;
        }

        const stake = parseInt(customStake);
        console.log('💰 Stake parsed:', stake);

        if (!stake || stake < 100) {
            console.log('❌ Invalid stake:', stake);
            setModalData({ ...modalData, errorMessage: 'La mise doit être d\'au moins 100 MGA' });
            setShowErrorModal(true);
            return;
        }

        if (config && stake > 50000) {
            console.log('❌ Stake too high:', stake);
            setModalData({ ...modalData, errorMessage: 'La mise ne peut pas dépasser 50 000 MGA' });
            setShowErrorModal(true);
            return;
        }

        console.log('✅ All validations passed, showing confirmation modal');
        setShowConfirmModal(true);
    };

    const handleConfirmBet = async () => {
        console.log('✅ User confirmed bet, calling executeBet...');
        setShowConfirmModal(false);

        try {
            const stake = parseInt(customStake);
            const result = await executeBet(stake, acceptOddsChange);
            console.log('🎉 Bet execution successful:', result);

            setModalData({
                betId: result.bet_id.toString(),
                potentialPayout: formatCurrency(result.potential_payout),
                errorMessage: '',
            });
            setShowSuccessModal(true);

            await refetchMatches();
        } catch (err) {
            console.log('💥 Bet execution failed:', err);
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

    // Rendu d'un match pour mobile
    const renderMobileMatch = (match: FootballMatch, index: number) => (
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

    // Rendu d'un match pour desktop (format tableau)
    const renderDesktopMatch = ({ item: match, index }: { item: FootballMatch, index: number }) => (
        <View style={[styles.desktopMatchRow, { borderBottomColor: colors.border }]}>
            <View style={styles.desktopMatchCell}>
                <Text variant="body" weight="bold" color="text">
                    {match.home_team} vs {match.away_team}
                </Text>
            </View>

            <View style={styles.desktopMatchCell}>
                <Text variant="body" color="textSecondary">
                    {match.bet}
                </Text>
            </View>

            <View style={styles.desktopMatchCell}>
                <View style={[styles.oddsBadge, { backgroundColor: colors.primary }]}>
                    <Text variant="label" style={{ color: '#ffffff' }}>{match.odds}</Text>
                </View>
            </View>

            <View style={styles.desktopMatchCell}>
                <Text variant="body" color="textSecondary">
                    {formatDate(match.expected_start)}
                </Text>
            </View>
        </View>
    );

    // Rendu de la section configuration
    const renderConfigSection = () => (
        config && (
            <View style={[
                styles.configSection,
                screenSize.isDesktop && styles.desktopConfigSection
            ]}>
                <Text
                    variant={screenSize.isDesktop ? "heading2" : "heading3"}
                    color="text"
                >
                    Configuration
                </Text>

                <View style={[
                    styles.configRow,
                    screenSize.isDesktop && styles.desktopConfigRow
                ]}>
                    <Text variant="caption" color="textSecondary">
                        Plage de cotes: {config.constraints.min_odds} - {config.constraints.max_odds}
                    </Text>
                    <Text variant="caption" color="textSecondary">
                        Max matchs: {config.constraints.max_matches}
                    </Text>
                    <Text variant="caption" color="textSecondary">
                        Mise (MGA): {formatCurrency(config.settings.default_stake)} • Entre 100 et 50 000 MGA
                    </Text>
                </View>
            </View>
        )
    );

    // Rendu de la section résumé
    const renderSummarySection = () => (
        matches && (
            <View style={[
                styles.section,
                screenSize.isDesktop && styles.desktopSection
            ]}>
                <View style={styles.summaryHeader}>
                    <Text
                        variant={screenSize.isDesktop ? "heading2" : "heading3"}
                        color="text"
                    >
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

                <View style={[
                    styles.summaryStats,
                    screenSize.isDesktop && styles.desktopSummaryStats
                ]}>
                    <View style={[styles.statItem, screenSize.isDesktop && styles.desktopStatItem]}>
                        <Text variant="caption" color="textSecondary">
                            Cote totale
                        </Text>
                        <Text
                            variant={screenSize.isDesktop ? "heading2" : "heading3"}
                            color="primary"
                        >
                            {matches.summary.total_odds.toFixed(2)}
                        </Text>
                    </View>

                    <View style={[styles.statItem, screenSize.isDesktop && styles.desktopStatItem]}>
                        <Text variant="caption" color="textSecondary">
                            Gain estimé
                        </Text>
                        <Text
                            variant={screenSize.isDesktop ? "heading2" : "heading3"}
                            color="success"
                        >
                            {formatCurrency(matches.summary.estimated_payout)}
                        </Text>
                    </View>
                </View>
            </View>
        )
    );

    // Rendu de la section pari
    const renderBetSection = () => (
        <View style={[
            styles.section,
            screenSize.isDesktop && styles.desktopSection
        ]}>
            <Text
                variant={screenSize.isDesktop ? "heading2" : "heading3"}
                color="text"
            >
                Configuration du Pari
            </Text>

            <View style={styles.checkboxContainer}>
                <View style={[
                    styles.checkbox,
                    {
                        borderColor: colors.textSecondary,
                        backgroundColor: colors.textSecondary,
                    },
                ]}>
                    <Ionicons name="checkmark" size={16} color="#ffffff" />
                </View>
                <Text variant="caption" color="textSecondary" style={styles.checkboxLabel}>
                    Accepter les changements de cotes
                </Text>
            </View>

            <Button
                title={loading ? 'Exécution...' : `Parier maintenant`}
                onPress={handleExecuteBet}
                variant="outline"
                size={screenSize.isDesktop ? "md" : "sm"}
                disabled={loading || !matches?.total_matches}
                loading={loading}
                style={{
                    borderColor: matches?.total_matches ? colors.success : colors.textSecondary,
                    ...(screenSize.isDesktop && { minWidth: 200 })
                }}
                textStyle={{
                    color: matches?.total_matches ? colors.success : colors.textSecondary,
                }}
            />
        </View>
    );

    // Rendu de la section matchs
    const renderMatchesSection = () => {
        if (!matches?.matches.length) {
            return (
                <View style={[
                    styles.section,
                    screenSize.isDesktop && styles.desktopSection
                ]}>
                    <View style={styles.emptyState}>
                        <Ionicons name="football-outline" size={48} color={colors.textSecondary} />
                        <Text
                            variant={screenSize.isDesktop ? "heading2" : "heading3"}
                            color="text"
                            style={{ marginTop: spacing.md }}
                        >
                            Aucun match disponible
                        </Text>
                        <Text variant="body" color="textSecondary" style={{ textAlign: 'center', marginTop: spacing.xs }}>
                            Aucun match ne correspond aux critères de configuration actuels
                        </Text>
                    </View>
                </View>
            );
        }

        return (
            <View style={[
                styles.section,
                screenSize.isDesktop && styles.desktopSection
            ]}>
                <Text
                    variant={screenSize.isDesktop ? "heading2" : "heading3"}
                    color="text"
                >
                    Matchs sélectionnés
                </Text>

                {screenSize.isDesktop ? (
                    // Vue desktop - Format tableau
                    <View style={styles.desktopMatchesContainer}>
                        {/* En-tête du tableau */}
                        <View style={[styles.desktopMatchHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                            <View style={styles.desktopHeaderCell}>
                                <Text variant="body" weight="bold" color="text">Match</Text>
                            </View>
                            <View style={styles.desktopHeaderCell}>
                                <Text variant="body" weight="bold" color="text">Pari</Text>
                            </View>
                            <View style={styles.desktopHeaderCell}>
                                <Text variant="body" weight="bold" color="text">Cote</Text>
                            </View>
                            <View style={styles.desktopHeaderCell}>
                                <Text variant="body" weight="bold" color="text">Date/Heure</Text>
                            </View>
                        </View>

                        {/* Liste des matchs */}
                        <FlatList
                            data={matches.matches}
                            renderItem={renderDesktopMatch}
                            keyExtractor={(item, index) => `match-${index}`}
                            scrollEnabled={false}
                        />
                    </View>
                ) : (
                    // Vue mobile - Format cartes
                    <View style={styles.matchesList}>
                        {matches.matches.map((match, index) => renderMobileMatch(match, index))}
                    </View>
                )}
            </View>
        );
    };

    const renderSkeletonContent = () => (
        <View style={[
            styles.content,
            screenSize.isDesktop && styles.desktopContent
        ]}>
            {/* Configuration Skeleton */}
            <View style={[
                styles.configSection,
                screenSize.isDesktop && styles.desktopConfigSection
            ]}>
                <Text
                    variant={screenSize.isDesktop ? "heading2" : "heading3"}
                    color="text"
                >
                    Configuration
                </Text>
                <View style={styles.configRow}>
                    <Skeleton width="25%" height={14} animated={false} />
                    <Skeleton width="15%" height={14} animated={false} />
                    <Skeleton width="30%" height={14} animated={false} />
                </View>
            </View>

            {/* Résumé Skeleton */}
            {!screenSize.isDesktop && <View style={[styles.separator, { backgroundColor: colors.border }]} />}

            <View style={[
                styles.section,
                screenSize.isDesktop && styles.desktopSection
            ]}>
                <View style={styles.summaryHeader}>
                    <Skeleton width="60%" height={24} animated={false} />
                    <Skeleton width={60} height={28} borderRadius={14} animated={false} />
                </View>
                <View style={styles.summaryStats}>
                    <View style={styles.statItem}>
                        <Text variant="caption" color="textSecondary">Cote totale</Text>
                        <Skeleton width="50%" height={24} animated={false} />
                    </View>
                    <View style={styles.statItem}>
                        <Text variant="caption" color="textSecondary">Gain estimé</Text>
                        <Skeleton width="80%" height={24} animated={false} />
                    </View>
                </View>
            </View>
        </View>
    );

    const renderContent = () => (
        <View style={[
            styles.content,
            screenSize.isDesktop && styles.desktopContent
        ]}>
            {screenSize.isDesktop ? (
                // Layout desktop avec colonnes
                <View style={styles.desktopLayout}>
                    <View style={styles.desktopLeftColumn}>
                        {renderConfigSection()}
                        {renderSummarySection()}
                        {renderBetSection()}
                    </View>
                    <View style={styles.desktopRightColumn}>
                        {renderMatchesSection()}
                    </View>
                </View>
            ) : (
                // Layout mobile/tablette
                <>
                    {renderConfigSection()}
                    <View style={[styles.separator, { backgroundColor: colors.border }]} />
                    {renderSummarySection()}
                    <View style={[styles.separator, { backgroundColor: colors.border }]} />
                    {renderBetSection()}
                    <View style={[styles.separator, { backgroundColor: colors.border }]} />
                    {renderMatchesSection()}
                </>
            )}
        </View>
    );

    return (
        <>
            <ScrollView
                style={styles.container}
                contentContainerStyle={{ paddingBottom: 50 }}
                refreshControl={
                    <RefreshControl
                        refreshing={loading && !!(config && matches)}
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
                title="Confirmer le pari"
                message={`Êtes-vous sûr de vouloir parier ${formatCurrency(parseInt(customStake) || 0)} sur ${matches?.total_matches || 0} matchs ?\n\nGain potentiel: ${formatCurrency((matches?.summary.total_odds || 0) * (parseInt(customStake) || 0))}`}
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
                title="Pari exécuté !"
                betId={modalData.betId}
                potentialPayout={modalData.potentialPayout}
                customMessage="Votre pari a été placé avec succès."
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

    // Styles communs
    configSection: {
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

    // Mobile matches
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

    // Styles desktop
    desktopContent: {
        padding: spacing.xl,
        maxWidth: 1400,
        alignSelf: 'center',
        width: '100%',
    },

    desktopLayout: {
        flexDirection: 'row',
        gap: spacing.xl * 2,
    },

    desktopLeftColumn: {
        flex: 1,
        gap: spacing.xl,
    },

    desktopRightColumn: {
        flex: 1,
        gap: spacing.xl,
    },

    desktopConfigSection: {
        padding: spacing.xl,
        backgroundColor: 'rgba(0,0,0,0.02)',
        borderRadius: 16,
    },

    desktopConfigRow: {
        gap: spacing.md,
    },

    desktopSection: {
        padding: spacing.xl,
        backgroundColor: 'rgba(0,0,0,0.02)',
        borderRadius: 16,
    },

    desktopSummaryStats: {
        gap: spacing.xl,
    },

    desktopStatItem: {
        padding: spacing.lg,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        alignItems: 'center',
    },

    // Desktop matches table
    desktopMatchesContainer: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },

    desktopMatchHeader: {
        flexDirection: 'row',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderBottomWidth: 2,
    },

    desktopHeaderCell: {
        flex: 1,
        paddingHorizontal: spacing.sm,
    },

    desktopMatchRow: {
        flexDirection: 'row',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderBottomWidth: 1,
        alignItems: 'center',
        minHeight: 60,
    },

    desktopMatchCell: {
        flex: 1,
        paddingHorizontal: spacing.sm,
        justifyContent: 'center',
    },
});