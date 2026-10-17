// TurboAutoBetTab.tsx - « Grolo Turbo » : même pari automatique que Grolo, mais répété toutes les N
// heures (3h/5h/8h/personnalisé) au lieu d'une seule fois à 00h00. Basé sur AutoBetTab.tsx.
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
import { useScreenSize } from './configTabShared';
import IntervalSelector from '../IntervalSelector';

import Button from '@/src/components/atoms/Button';
import Text from '@/src/components/atoms/Text';
import Skeleton from '@/src/components/atoms/Skeleton';
import SuccessModal from '@/src/components/molecules/SuccessModal';
import { spacing } from '@/src/styles';

export default function TurboAutoBetTab() {
    const { colors } = useTheme();
    const screenSize = useScreenSize();

    const { data: config, isLoading: configLoading, error: configError } = useGroloConfig();
    const { refreshConfig } = useGroloUtils();
    const {
        autoExecutionActive,
        autoExecutionIntervalHours,
        loading: contextLoading,
        error: contextError,
        startAutoExecution,
        stopAutoExecution,
    } = useFootball();

    const loading = configLoading || contextLoading;
    const error = configError?.message || contextError;
    const initialLoading = configLoading && !config;

    const [localAutoActive, setLocalAutoActive] = useState(false);
    // Intervalle choisi localement avant de démarrer (reprend celui en cours si déjà actif)
    const [selectedInterval, setSelectedInterval] = useState(3);

    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [modalData, setModalData] = useState({
        title: '',
        message: '',
        type: 'success' as 'success' | 'info',
    });

    React.useEffect(() => {
        setLocalAutoActive(autoExecutionActive);
        if (autoExecutionActive && autoExecutionIntervalHours) {
            setSelectedInterval(autoExecutionIntervalHours);
        }
    }, [autoExecutionActive, autoExecutionIntervalHours]);

    const onRefresh = useCallback(async () => {
        try {
            await refreshConfig();
        } catch (err) {
            console.error('Refresh error:', err);
        }
    }, [refreshConfig]);

    const handleToggleAutoExecution = async () => {
        try {
            if (localAutoActive) {
                await stopAutoExecution();
                setModalData({
                    title: 'Grolo Turbo arrêté',
                    message: 'L\'exécution automatique répétée a été désactivée avec succès.',
                    type: 'info',
                });
                setShowSuccessModal(true);
            } else {
                await startAutoExecution(selectedInterval);
                setModalData({
                    title: 'Grolo Turbo démarré',
                    message: `Le pari se déclenchera automatiquement toutes les ${selectedInterval} heures, en attendant le premier intervalle complet avant le premier pari. Cette application s'exécute toujours même si votre téléphone n'a pas de connexion internet.`,
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

    const renderConfigSection = () => (
        <View style={[
            styles.configSection,
            screenSize.isDesktop && styles.desktopConfigSection
        ]}>
            <View style={styles.sectionHeader}>
                <Text variant={screenSize.isDesktop ? "heading2" : "heading3"} color="text">
                    Configuration Actuelle
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: colors.success }]}>
                    <Text variant="label" style={{ color: '#ffffff' }}>Actif</Text>
                </View>
            </View>
            <Text variant="caption" color="textSecondary" style={{ marginBottom: spacing.md }}>
                Même configuration que Grolo (cotes, nombre de matchs, mise) : seule la fréquence
                d'exécution automatique change ci-dessous.
            </Text>

            <View style={[styles.configGrid, screenSize.isDesktop && styles.desktopConfigGrid]}>
                <View style={[styles.configItem, screenSize.isDesktop && styles.desktopConfigItem]}>
                    <Text variant="caption" color="textSecondary">Cotes</Text>
                    {config ? (
                        <Text variant={screenSize.isDesktop ? "heading3" : "body"} weight="bold" color="text">
                            {config.constraints.min_odds} - {config.constraints.max_odds}
                        </Text>
                    ) : (
                        <Skeleton width="70%" height={screenSize.isDesktop ? 24 : 18} animated={false} />
                    )}
                </View>

                <View style={[styles.configItem, screenSize.isDesktop && styles.desktopConfigItem]}>
                    <Text variant="caption" color="textSecondary">Max Matchs</Text>
                    {config ? (
                        <Text variant={screenSize.isDesktop ? "heading3" : "body"} weight="bold" color="text">
                            {config.constraints.max_matches}
                        </Text>
                    ) : (
                        <Skeleton width="30%" height={screenSize.isDesktop ? 24 : 18} animated={false} />
                    )}
                </View>

                <View style={[styles.configItem, screenSize.isDesktop && styles.desktopConfigItem]}>
                    <Text variant="caption" color="textSecondary">Mise par défaut</Text>
                    {config ? (
                        <Text variant={screenSize.isDesktop ? "heading3" : "body"} weight="bold" color="primary">
                            {formatCurrency(config.settings.default_stake)}
                        </Text>
                    ) : (
                        <Skeleton width="80%" height={screenSize.isDesktop ? 24 : 18} animated={false} />
                    )}
                </View>
            </View>
        </View>
    );

    const renderAutoExecutionSection = () => (
        <View style={[styles.section, screenSize.isDesktop && styles.desktopSection]}>
            <Text variant={screenSize.isDesktop ? "heading2" : "heading3"} color="text">
                Exécution Automatique Répétée
            </Text>

            <View style={[styles.autoSection, screenSize.isDesktop && styles.desktopAutoSection]}>
                <View style={styles.autoInfo}>
                    <Ionicons name="repeat-outline" size={screenSize.isDesktop ? 28 : 24} color={colors.primary} />
                    <View style={styles.autoTextContainer}>
                        <Text variant={screenSize.isDesktop ? "heading3" : "body"} weight="bold" color="text">
                            {localAutoActive
                                ? `Pari automatique toutes les ${selectedInterval}h`
                                : 'Choisissez la fréquence'}
                        </Text>
                        <Text variant="caption" color="textSecondary">
                            Fuseau horaire : Madagascar (Indian/Antananarivo)
                        </Text>
                    </View>
                </View>

                <View style={styles.statusContainer}>
                    <View style={[styles.statusIndicator, { backgroundColor: localAutoActive ? colors.success : colors.error }]} />
                    <Text variant="caption" weight="bold" style={{ color: localAutoActive ? colors.success : colors.error }}>
                        {localAutoActive ? 'Actif' : 'Inactif'}
                    </Text>
                </View>
            </View>

            {!localAutoActive && (
                <IntervalSelector value={selectedInterval} onChange={setSelectedInterval} disabled={loading} />
            )}

            <Button
                title={loading
                    ? 'Traitement...'
                    : localAutoActive
                        ? 'Arrêter Grolo Turbo'
                        : `Démarrer Grolo Turbo (toutes les ${selectedInterval}h)`
                }
                onPress={handleToggleAutoExecution}
                variant="outline"
                size={screenSize.isDesktop ? "md" : "sm"}
                disabled={loading}
                loading={loading}
                style={{
                    marginTop: spacing.md,
                    borderColor: localAutoActive ? colors.error : colors.success,
                    paddingVertical: spacing.xs,
                    paddingHorizontal: spacing.xs,
                }}
                textStyle={{ color: localAutoActive ? colors.error : colors.success }}
            />
        </View>
    );

    const renderInformationSection = () => (
        <View style={[styles.section, screenSize.isDesktop && styles.desktopSection]}>
            <Text variant={screenSize.isDesktop ? "heading2" : "heading3"} color="text">
                Informations
            </Text>
            <View style={[styles.infoList, screenSize.isDesktop && styles.desktopInfoList]}>
                <View style={[styles.infoItem, screenSize.isDesktop && styles.desktopInfoItem]}>
                    <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
                    <Text variant="caption" color="textSecondary" style={styles.infoText}>
                        Le premier pari attend un intervalle complet (ex: 3h) avant de partir — pas
                        d'exécution immédiate au démarrage
                    </Text>
                </View>
                <View style={[styles.infoItem, screenSize.isDesktop && styles.desktopInfoItem]}>
                    <Ionicons name="checkmark-circle-outline" size={16} color={colors.success} />
                    <Text variant="caption" color="textSecondary" style={styles.infoText}>
                        Seuls les matchs validés selon la configuration Grolo seront pariés
                    </Text>
                </View>
                <View style={[styles.infoItem, screenSize.isDesktop && styles.desktopInfoItem]}>
                    <Ionicons name="shield-checkmark-outline" size={16} color={colors.primary} />
                    <Text variant="caption" color="textSecondary" style={styles.infoText}>
                        Vous pouvez arrêter l'exécution automatique à tout moment
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
                contentContainerStyle={[styles.content, screenSize.isDesktop && styles.desktopContent]}
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
                    <View style={styles.desktopLayout}>
                        <View style={styles.desktopLeftColumn}>
                            {renderConfigSection()}
                            {renderAutoExecutionSection()}
                        </View>
                        <View style={styles.desktopRightColumn}>
                            {renderInformationSection()}
                        </View>
                    </View>
                ) : (
                    <>
                        {renderConfigSection()}
                        <View style={[styles.separator, { backgroundColor: colors.border }]} />
                        {renderAutoExecutionSection()}
                        <View style={[styles.separator, { backgroundColor: colors.border }]} />
                        {renderInformationSection()}
                    </>
                )}
            </ScrollView>

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
    container: { flex: 1 },
    content: { padding: spacing.lg },
    configSection: { paddingBottom: spacing.lg },
    section: { paddingVertical: spacing.lg },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    separator: { height: 1, marginVertical: spacing.xs },
    statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: 20 },
    configGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
    configItem: { flex: 1, minWidth: '45%' },
    autoSection: { marginBottom: spacing.lg },
    autoInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
    autoTextContainer: { marginLeft: spacing.sm, flex: 1 },
    statusContainer: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    statusIndicator: { width: 12, height: 12, borderRadius: 6 },
    infoList: { gap: spacing.sm },
    infoItem: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs },
    infoText: { flex: 1, lineHeight: 20 },
    desktopContent: { padding: spacing.xl, maxWidth: 1400, alignSelf: 'center', width: '100%' },
    desktopLayout: { flexDirection: 'row', gap: spacing.xl * 2 },
    desktopLeftColumn: { flex: 2, gap: spacing.xl },
    desktopRightColumn: { flex: 1, gap: spacing.xl },
    desktopConfigSection: { padding: spacing.xl, backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: 16 },
    desktopConfigGrid: { gap: spacing.xl },
    desktopConfigItem: {
        minWidth: 200, padding: spacing.lg, backgroundColor: '#ffffff', borderRadius: 12,
        elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
    },
    desktopSection: { padding: spacing.xl, backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: 16 },
    desktopAutoSection: {
        padding: spacing.lg, backgroundColor: '#ffffff', borderRadius: 12,
        elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
    },
    desktopInfoList: { gap: spacing.md },
    desktopInfoItem: {
        padding: spacing.md, backgroundColor: '#ffffff', borderRadius: 8,
        elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2,
    },
});
