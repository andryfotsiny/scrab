// MiniAutoBetTab.tsx - VERSION RESPONSIVE
import React, { useState, useCallback, useEffect } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    RefreshControl,
    Dimensions,
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

export default function MiniAutoBetTab() {
    const { colors } = useTheme();
    const screenSize = useScreenSize();

    // Utilisation directe des hooks React Query + contexte simplifié
    const { data: config, isLoading: configLoading, error: configError } = useMiniConfig();
    const { refreshConfig } = useMiniUtils();
    const {
        miniAutoExecutionActive,
        loading: contextLoading,
        error: contextError,
        startAutoExecution,
        stopAutoExecution,
    } = useMini();

    // États de chargement dérivés
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

    // React Query gère automatiquement le refresh
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

    // Rendu de la configuration Mini pour desktop
    const renderDesktopConfigSection = () => (
        <View style={[
            styles.configSection,
            screenSize.isDesktop && styles.desktopConfigSection
        ]}>
            <View style={styles.sectionHeader}>
                <Text
                    variant={screenSize.isDesktop ? "heading2" : "heading3"}
                    color="text"
                >
                    Configuration Mini
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: colors.success }]}>
                    <Text variant="label" style={{ color: '#ffffff' }}>
                        Actif
                    </Text>
                </View>
            </View>

            <View style={[
                styles.configGrid,
                screenSize.isDesktop && styles.desktopConfigGrid
            ]}>
                <View style={[styles.configItem, screenSize.isDesktop && styles.desktopConfigItem]}>
                    <Text variant="caption" color="textSecondary">
                        Cotes
                    </Text>
                    {config ? (
                        <Text
                            variant={screenSize.isDesktop ? "heading3" : "body"}
                            weight="bold"
                            color="text"
                        >
                            {config.constraints.min_odds} - {config.constraints.max_odds}
                        </Text>
                    ) : (
                        <Skeleton width="70%" height={screenSize.isDesktop ? 24 : 18} animated={false} />
                    )}
                </View>

                <View style={[styles.configItem, screenSize.isDesktop && styles.desktopConfigItem]}>
                    <Text variant="caption" color="textSecondary">
                        Nombre de matchs
                    </Text>
                    {config ? (
                        <Text
                            variant={screenSize.isDesktop ? "heading3" : "body"}
                            weight="bold"
                            color="text"
                        >
                            {config.constraints.max_matches} matchs
                        </Text>
                    ) : (
                        <Skeleton width="40%" height={screenSize.isDesktop ? 24 : 18} animated={false} />
                    )}
                </View>

                <View style={[styles.configItem, screenSize.isDesktop && styles.desktopConfigItem]}>
                    <Text variant="caption" color="textSecondary">
                        Mise par défaut
                    </Text>
                    {config ? (
                        <Text
                            variant={screenSize.isDesktop ? "heading3" : "body"}
                            weight="bold"
                            color="primary"
                        >
                            {formatCurrency(config.settings.default_stake)}
                        </Text>
                    ) : (
                        <Skeleton width="80%" height={screenSize.isDesktop ? 24 : 18} animated={false} />
                    )}
                </View>
            </View>
        </View>
    );

    // Rendu de la section d'exécution automatique Mini
    const renderAutoExecutionSection = () => (
        <View style={[
            styles.section,
            screenSize.isDesktop && styles.desktopSection
        ]}>
            <Text
                variant={screenSize.isDesktop ? "heading2" : "heading3"}
                color="text"
            >
                Exécution Automatique Mini
            </Text>

            <View style={[
                styles.autoSection,
                screenSize.isDesktop && styles.desktopAutoSection
            ]}>
                <View style={styles.autoInfo}>
                    <Ionicons
                        name="flash-outline"
                        size={screenSize.isDesktop ? 28 : 24}
                        color={colors.primary}
                    />
                    <View style={styles.autoTextContainer}>
                        <Text
                            variant={screenSize.isDesktop ? "heading3" : "body"}
                            weight="bold"
                            color="text"
                        >
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
                size={screenSize.isDesktop ? "md" : "sm"}
                disabled={loading}
                loading={loading}
                style={{
                    borderColor: miniAutoExecutionActive ? colors.error : colors.success,
                    paddingVertical: spacing.xs,
                    paddingHorizontal: spacing.xs,
                    ...(screenSize.isDesktop && { minWidth: 200 })
                }}
                textStyle={{
                    color: miniAutoExecutionActive ? colors.error : colors.success,
                }}
            />
        </View>
    );

    // Rendu de la section d'informations Mini
    const renderInformationSection = () => (
        <View style={[
            styles.section,
            screenSize.isDesktop && styles.desktopSection
        ]}>
            <Text
                variant={screenSize.isDesktop ? "heading2" : "heading3"}
                color="text"
            >
                Informations Mini
            </Text>

            <View style={[
                styles.infoList,
                screenSize.isDesktop && styles.desktopInfoList
            ]}>
                <View style={[styles.infoItem, screenSize.isDesktop && styles.desktopInfoItem]}>
                    <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
                    <Text variant="caption" color="textSecondary" style={styles.infoText}>
                        Le système Mini sélectionne automatiquement exactement 2 matchs
                    </Text>
                </View>

                <View style={[styles.infoItem, screenSize.isDesktop && styles.desktopInfoItem]}>
                    <Ionicons name="checkmark-circle-outline" size={16} color={colors.success} />
                    <Text variant="caption" color="textSecondary" style={styles.infoText}>
                        Cotes optimisées pour des gains réguliers avec risque réduit
                    </Text>
                </View>

                <View style={[styles.infoItem, screenSize.isDesktop && styles.desktopInfoItem]}>
                    <Ionicons name="shield-checkmark-outline" size={16} color={colors.primary} />
                    <Text variant="caption" color="textSecondary" style={styles.infoText}>
                        Exécution quotidienne à minuit (Madagascar) - Cache intelligent
                    </Text>
                </View>

                <View style={[styles.infoItem, screenSize.isDesktop && styles.desktopInfoItem]}>
                    <Ionicons name="server-outline" size={16} color={colors.success} />
                    <Text variant="caption" color="textSecondary" style={styles.infoText}>
                        Cette application s'exécute toujours même si votre téléphone n'a pas de connexion internet
                    </Text>
                </View>
            </View>
        </View>
    );

    return (
        <>
            <ScrollView
                style={styles.container}
                contentContainerStyle={[
                    styles.content,
                    screenSize.isDesktop && styles.desktopContent
                ]}
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
                {screenSize.isDesktop ? (
                    // Layout desktop avec colonnes
                    <View style={styles.desktopLayout}>
                        <View style={styles.desktopLeftColumn}>
                            {renderDesktopConfigSection()}
                            {renderAutoExecutionSection()}
                        </View>
                        <View style={styles.desktopRightColumn}>
                            {renderInformationSection()}
                        </View>
                    </View>
                ) : (
                    // Layout mobile/tablette
                    <>
                        {renderDesktopConfigSection()}

                        {/* Ligne de séparation */}
                        <View style={[styles.separator, { backgroundColor: colors.border }]} />

                        {renderAutoExecutionSection()}

                        {/* Ligne de séparation */}
                        <View style={[styles.separator, { backgroundColor: colors.border }]} />

                        {renderInformationSection()}
                    </>
                )}
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

    // Styles communs
    configSection: {
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

    // Configuration Mini
    configGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
    },
    configItem: {
        flex: 1,
        minWidth: '45%',
    },

    // Auto execution Mini
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

    // Informations Mini
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
        flex: 2,
        gap: spacing.xl,
    },

    desktopRightColumn: {
        flex: 1,
        gap: spacing.xl,
    },

    desktopConfigSection: {
        padding: spacing.xl,
        backgroundColor: 'rgba(255, 152, 0, 0.05)', // Nuance orange légère pour Mini
        borderRadius: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#FF9800', // Bordure orange pour identifier Mini
    },

    desktopConfigGrid: {
        gap: spacing.xl,
    },

    desktopConfigItem: {
        minWidth: 200,
        padding: spacing.lg,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        borderLeftWidth: 3,
        borderLeftColor: '#FF9800', // Accent orange Mini
    },

    desktopSection: {
        padding: spacing.xl,
        backgroundColor: 'rgba(255, 152, 0, 0.05)', // Nuance orange légère
        borderRadius: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#FF9800',
    },

    desktopAutoSection: {
        padding: spacing.lg,
        backgroundColor: '#ffffff',
        borderRadius: 12,
    },

    desktopInfoList: {
        gap: spacing.md,
    },

    desktopInfoItem: {
        padding: spacing.md,
        backgroundColor: '#ffffff',
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#FF9800', // Accent orange Mini
    },
});