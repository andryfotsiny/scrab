// MiniAutoBetTab.tsx - UPDATED avec React Query
import React, { useState, useCallback } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    RefreshControl,
} from 'react-native';
import { useTheme } from '@/src/shared/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useMini } from '@/src/features/football/context/MiniContext';
import { useMiniConfig, useMiniUtils } from '@/src/shared/hooks/mini/useMiniQueries';

import Button from '@/src/components/atoms/Button';
import Text from '@/src/components/atoms/Text';
import Skeleton from '@/src/components/atoms/Skeleton';
import SuccessModal from '@/src/components/molecules/SuccessModal';
import { spacing } from '@/src/styles';

export default function MiniAutoBetTab() {
    const { colors } = useTheme();

    // ✅ Utilisation directe des hooks React Query + contexte simplifié
    const { data: config, isLoading: configLoading, error: configError } = useMiniConfig();
    const { refreshConfig } = useMiniUtils();
    const {
        miniAutoExecutionActive,
        loading: contextLoading,
        error: contextError,
        startAutoExecution,
        stopAutoExecution,
    } = useMini();

    // ✅ États de chargement dérivés
    const loading = configLoading || contextLoading;
    const error = configError?.message || contextError;
    const initialLoading = configLoading && !config;

    // Modal states
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [modalData, setModalData] = useState({
        title: '',
        message: '',
        type: 'success' as 'success' | 'info',
    });

    // ✅ React Query gère automatiquement le refresh
    const onRefresh = useCallback(async () => {
        try {
            await refreshConfig();
            console.log('🔄 MiniAutoBetTab: Config refreshed via React Query');
        } catch (err) {
            console.error('Refresh error:', err);
        }
    }, [refreshConfig]);

    const handleToggleAutoExecution = async () => {
        try {
            if (miniAutoExecutionActive) {
                await stopAutoExecution();
                setModalData({
                    title: 'Exécution automatique Mini arrêtée',
                    message: 'L\'exécution automatique Mini a été désactivée avec succès. Cette application s\'exécute toujours même si votre téléphone n\'a pas de connexion internet.',
                    type: 'info',
                });
                setShowSuccessModal(true);
            } else {
                await startAutoExecution();
                setModalData({
                    title: 'Exécution automatique Mini démarrée',
                    message: 'L\'exécution automatique Mini est maintenant active et se déclenchera à 00h00 Madagascar. Cette application s\'exécute toujours même si votre téléphone n\'a pas de connexion internet.',
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
            {/* Configuration Section Skeleton - SEULEMENT données API */}
            <View style={styles.firstSection}>
                <View style={styles.sectionHeader}>
                    <Text variant="heading3" color="text">
                        Configuration
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
                </View>
            </View>

            {/* Auto Execution Section - React Query gère l'état */}
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

            {/* Information Section - Textes statiques */}
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
                            Exécution quotidienne à minuit (Madagascar) - Cache intelligent
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
                            Configuration Mini
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
                            { backgroundColor: miniAutoExecutionActive ? colors.success : colors.error }
                        ]} />
                        <Text
                            variant="caption"
                            weight="bold"
                            style={{ color: miniAutoExecutionActive ? colors.success : colors.error }}
                        >
                            {miniAutoExecutionActive ? 'Actif' : 'Inactif'}
                        </Text>
                    </View>
                </View>

                <Button
                    title={loading
                        ? 'Traitement...'
                        : miniAutoExecutionActive
                            ? 'Arrêter'
                            : 'Démarrer'
                    }
                    onPress={handleToggleAutoExecution}
                    variant="outline"
                    size="sm"
                    disabled={loading}
                    loading={loading}
                    style={{
                        borderColor: miniAutoExecutionActive ? colors.error : colors.success,
                        paddingVertical: spacing.xs,
                        paddingHorizontal: spacing.xs,
                    }}
                    textStyle={{
                        color: miniAutoExecutionActive ? colors.error : colors.success,
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
                            Exécution quotidienne à minuit (Madagascar) - Cache intelligent
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
                        refreshing={loading && !!config} // Only show refresh si on a déjà des données
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