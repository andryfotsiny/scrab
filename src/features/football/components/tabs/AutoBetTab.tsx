// AutoBetTab.tsx - VERSION COMPLÈTE RECONSTRUITE
import React, { useState, useCallback } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    RefreshControl,
} from 'react-native';
import { useTheme } from '@/src/shared/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useFootball } from '@/src/features/football/context/FootballContext';
import { useGroloConfig, useGroloUtils } from '@/src/shared/hooks/grolo/useGroloQueries';

import Button from '@/src/components/atoms/Button';
import Text from '@/src/components/atoms/Text';
import Skeleton from '@/src/components/atoms/Skeleton';
import SuccessModal from '@/src/components/molecules/SuccessModal';
import { spacing } from '@/src/styles';

export default function AutoBetTab() {
    const { colors } = useTheme();

    // React Query hooks directs + contexte simplifié
    const { data: config, isLoading: configLoading, error: configError } = useGroloConfig();
    const { refreshConfig } = useGroloUtils();
    const {
        autoExecutionActive,
        loading: contextLoading,
        error: contextError,
        startAutoExecution,
        stopAutoExecution,
    } = useFootball();

    // États de chargement dérivés
    const loading = configLoading || contextLoading;
    const error = configError?.message || contextError;
    const initialLoading = configLoading && !config;

    const [localAutoActive, setLocalAutoActive] = useState(false);

    // Modal states
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [modalData, setModalData] = useState({
        title: '',
        message: '',
        type: 'success' as 'success' | 'info',
    });

    React.useEffect(() => {
        setLocalAutoActive(autoExecutionActive);
    }, [autoExecutionActive]);

    // React Query gère automatiquement le refresh
    const onRefresh = useCallback(async () => {
        try {
            await refreshConfig();
            console.log('🔄 AutoBetTab: Config refreshed via React Query');
        } catch (err) {
            console.error('Refresh error:', err);
        }
    }, [refreshConfig]);

    const handleToggleAutoExecution = async () => {
        try {
            if (localAutoActive) {
                await stopAutoExecution();
                setModalData({
                    title: 'Exécution automatique arrêtée',
                    message: 'L\'exécution automatique a été désactivée avec succès. Cette application s\'exécute toujours même si votre téléphone n\'a pas de connexion internet.',
                    type: 'info',
                });
                setShowSuccessModal(true);
            } else {
                await startAutoExecution();
                setModalData({
                    title: 'Exécution automatique démarrée',
                    message: 'L\'exécution automatique est maintenant active et se déclenchera à 00h00 Madagascar. Cette application s\'exécute toujours même si votre téléphone n\'a pas de connexion internet.',
                    type: 'success',
                });
                setShowSuccessModal(true);
            }
        } catch (err) {
            setModalData({
                title: 'Erreur',
                message: error || 'Une erreur est survenue lors de la modification.',
                type: 'info',
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

    const renderSkeletonContent = () => (
        <>
            {/* Configuration Section Skeleton */}
            <View style={styles.firstSection}>
                <View style={styles.sectionHeader}>
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
                        <Skeleton width="70%" height={18} animated={false} />
                    </View>

                    <View style={styles.configItem}>
                        <Text variant="caption" color="textSecondary">
                            Max Matchs
                        </Text>
                        <Skeleton width="30%" height={18} animated={false} />
                    </View>

                    <View style={styles.configItem}>
                        <Text variant="caption" color="textSecondary">
                            Mise par défaut
                        </Text>
                        <Skeleton width="80%" height={18} animated={false} />
                    </View>
                </View>
            </View>

            {/* Auto Execution Section */}
            <View style={styles.section}>
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
                        paddingVertical: spacing.xs,
                        paddingHorizontal: spacing.xs,
                    }}
                    textStyle={{
                        color: colors.textSecondary,
                    }}
                />
            </View>

            {/* Ligne de séparation */}
            <View style={[styles.separator, { backgroundColor: colors.border }]} />

            {/* Information Section */}
            <View style={styles.section}>
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

                    <View style={styles.infoItem}>
                        <Ionicons name="server-outline" size={16} color={colors.success} />
                        <Text variant="caption" color="textSecondary" style={styles.infoText}>
                            Cette application s'exécute toujours même si votre téléphone n'a pas de connexion internet
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
                    </View>
                </View>
            )}

            {/* Auto Execution Section */}
            <View style={styles.section}>
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
                            ? 'Arrêter l\'exécution automatique'
                            : 'Démarrer l\'exécution automatique'
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

            {/* Ligne de séparation */}
            <View style={[styles.separator, { backgroundColor: colors.border }]} />

            {/* Information Section */}
            <View style={styles.section}>
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

                    <View style={styles.infoItem}>
                        <Ionicons name="server-outline" size={16} color={colors.success} />
                        <Text variant="caption" color="textSecondary" style={styles.infoText}>
                            Cette application s'exécute toujours même si votre téléphone n'a pas de connexion internet
                        </Text>
                    </View>
                </View>
            </View>
        </>
    );

    return (
        <>
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={loading && !!config}
                        onRefresh={onRefresh}
                        tintColor={colors.primary}
                        colors={[colors.primary]}
                    />
                }
                showsVerticalScrollIndicator={false}
            >
                {initialLoading ? renderSkeletonContent() : renderContent()}
            </ScrollView>

            {/* Modals */}
            <SuccessModal
                visible={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                title={modalData.title}
                customMessage={modalData.message}
                type={modalData.type}
            />

            <SuccessModal
                visible={showErrorModal}
                onClose={() => setShowErrorModal(false)}
                title={modalData.title}
                customMessage={modalData.message}
                type="info"
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