// MiniBetNowTab.tsx - VERSION RESPONSIVE
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

export default function MiniBetNowTab() {
    const { colors } = useTheme();
    const screenSize = useScreenSize();

    // React Query hooks directs + contexte simplifié
    const { data: config, isLoading: configLoading, error: configError } = useMiniConfig();
    const { data: matches, isLoading: matchesLoading, error: matchesError, refetch: refetchMatches } = useMiniMatches();
    const { refreshConfig, refreshMatches } = useMiniUtils();
    const {
        loading: contextLoading,
        error: contextError,
        executeBet,
    } = useMini();

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
            console.log('🔄 MiniBetNowTab: Data refreshed via React Query');
        } catch (err) {
            console.error('Refresh error:', err);
        }
    }, [refreshConfig, refreshMatches]);

    const handleExecuteBet = async () => {
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

    // Rendu d'un match Mini pour mobile
    const renderMobileMatch = (match: MiniMatch, index: number) => (
        <View key={index} style={[styles.matchCard, { backgroundColor: colors.background }]}>
            <View style={styles.matchHeader}>
                <Text variant="caption" weight="bold" color="text" style={styles.matchTitle}>
                    {match.home_team} vs {match.away_team}
                </Text>
                <View style={[styles.oddsBadge, styles.miniOddsBadge]}>
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

    // Rendu d'un match Mini pour desktop (format tableau)
    const renderDesktopMatch = ({ item: match, index }: { item: MiniMatch, index: number }) => (
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
                <View style={[styles.oddsBadge, styles.miniOddsBadge]}>
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

    // Rendu de la section configuration Mini
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
                    Configuration Mini
                </Text>

                <View style={[
                    styles.configRow,
                    screenSize.isDesktop && styles.desktopConfigRow
                ]}>
                    <Text variant="caption" color="textSecondary">
                        Plage de cotes: {config.constraints.min_odds} - {config.constraints.max_odds}
                    </Text>
                    <Text variant="caption" color="textSecondary">
                        Système: {config.constraints.max_matches} matchs exactement
                    </Text>
                    <Text variant="caption" color="textSecondary">
                        Mise (MGA): {formatCurrency(config.settings.default_stake)} • Entre 100 et 50 000 MGA
                    </Text>
                </View>
            </View>
        )
    );

    // Rendu de la section résumé Mini
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
                        Mini - {matches.total_matches} matchs sélectionnés
                    </Text>
                    <View style={[
                        styles.statusBadge,
                        { backgroundColor: matches.validation_status === 'valid_and_ready' ? colors.success : '#FF9800' }
                    ]}>
                        <Text variant="label" style={{ color: '#ffffff' }}>
                            {matches.validation_status === 'valid_and_ready' ? 'Prêt' : 'Mini'}
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
                            style={{ color: '#FF9800' }}
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

    // Rendu de la section pari Mini
    const renderBetSection = () => (
        <View style={[
            styles.section,
            screenSize.isDesktop && styles.desktopSection
        ]}>
            <Text
                variant={screenSize.isDesktop ? "heading2" : "heading3"}
                color="text"
            >
                Configuration du Pari Mini
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
                disabled={loading || matches?.total_matches !== 2}
                loading={loading}
                style={{
                    borderColor: matches?.total_matches === 2 ? '#FF9800' : colors.textSecondary,
                    ...(screenSize.isDesktop && { minWidth: 200 })
                }}
                textStyle={{
                    color: matches?.total_matches === 2 ? '#FF9800' : colors.textSecondary,
                }}
            />
        </View>
    );

    // Rendu de la section matchs Mini
    const renderMatchesSection = () => {
        if (matches?.matches.length !== 2) {
            return (
                <View style={[
                    styles.section,
                    screenSize.isDesktop && styles.desktopSection
                ]}>
                    <View style={styles.emptyState}>
                        <Ionicons name="flash-outline" size={48} color="#FF9800" />
                        <Text
                            variant={screenSize.isDesktop ? "heading2" : "heading3"}
                            color="text"
                            style={{ marginTop: spacing.md }}
                        >
                            Sélection en cours
                        </Text>
                        <Text variant="body" color="textSecondary" style={{ textAlign: 'center', marginTop: spacing.xs }}>
                            Le système Mini sélectionne automatiquement 2 matchs optimaux via React Query
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
                    2 Matchs Mini sélectionnés
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
                            keyExtractor={(item, index) => `mini-match-${index}`}
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
            {/* Configuration Mini Skeleton */}
            <View style={[
                styles.configSection,
                screenSize.isDesktop && styles.desktopConfigSection
            ]}>
                <Text
                    variant={screenSize.isDesktop ? "heading2" : "heading3"}
                    color="text"
                >
                    Configuration Mini
                </Text>
                <View style={styles.configRow}>
                    <Skeleton width="25%" height={14} animated={false} />
                    <Skeleton width="35%" height={14} animated={false} />
                    <Skeleton width="30%" height={14} animated={false} />
                </View>
            </View>

            {/* Résumé Mini Skeleton */}
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
                        tintColor="#FF9800"
                        colors={["#FF9800"]}
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
                title="Confirmer le pari Mini"
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
                title="Pari Mini exécuté !"
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

    // Mobile matches Mini
    matchesList: {
        gap: spacing.sm,
    },
    matchCard: {
        borderRadius: 8,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: 'rgba(255, 152, 0, 0.3)', // Bordure orange pour Mini
        borderLeftWidth: 3,
        borderLeftColor: '#FF9800',
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
    miniOddsBadge: {
        backgroundColor: '#FF9800', // Orange pour Mini
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
        backgroundColor: 'rgba(255, 152, 0, 0.05)', // Fond orange Mini
        borderRadius: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#FF9800',
    },

    desktopConfigRow: {
        gap: spacing.md,
    },

    desktopSection: {
        padding: spacing.xl,
        backgroundColor: 'rgba(255, 152, 0, 0.05)', // Fond orange Mini
        borderRadius: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#FF9800',
    },

    desktopSummaryStats: {
        gap: spacing.xl,
    },

    desktopStatItem: {
        padding: spacing.lg,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        alignItems: 'center',
        borderLeftWidth: 3,
        borderLeftColor: '#FF9800', // Accent orange Mini
    },

    // Desktop matches table Mini
    desktopMatchesContainer: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        overflow: 'hidden',
        borderLeftWidth: 4,
        borderLeftColor: '#FF9800', // Bordure orange Mini
        borderWidth: 1,
        borderColor: 'rgba(255, 152, 0, 0.3)',
    },

    desktopMatchHeader: {
        flexDirection: 'row',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderBottomWidth: 2,
        borderBottomColor: '#FF9800', // Bordure orange pour header
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