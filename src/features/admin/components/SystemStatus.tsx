// src/features/admin/components/SystemStatus.tsx - Version Responsive
import React, { useCallback, useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    RefreshControl,
    ScrollView,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/shared/context/ThemeContext';
import {
    useSystemStatus,
    useAuthenticatedUsers,
    useRefreshAdminData
} from '@/src/shared/hooks/admin/useAdminQueries';
import Text from '@/src/components/atoms/Text';
import Button from '@/src/components/atoms/Button';
import Skeleton from '@/src/components/atoms/Skeleton';
import ConfirmationModal from '@/src/components/molecules/ConfirmationModal';
import SuccessModal from '@/src/components/molecules/SuccessModal';
import { spacing } from '@/src/styles';

interface ModalState {
    visible: boolean;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'error';
}

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

export default function SystemStatus() {
    const { colors } = useTheme();
    const { data: systemStatus, isLoading: statusLoading, error: statusError } = useSystemStatus();
    const { data: authUsers, isLoading: authLoading } = useAuthenticatedUsers();
    const refreshMutation = useRefreshAdminData();
    const screenSize = useScreenSize();

    const isLoading = statusLoading || authLoading;
    const isRefreshing = refreshMutation.isPending;

    // États pour les modales
    const [errorModal, setErrorModal] = useState<ModalState>({
        visible: false,
        title: '',
        message: '',
        type: 'error',
    });

    const [successModal, setSuccessModal] = useState<{
        visible: boolean;
        title: string;
        message: string;
    }>({
        visible: false,
        title: '',
        message: '',
    });

    // Fonctions helper pour les modales
    const showErrorModal = useCallback((title: string, message: string) => {
        setErrorModal({
            visible: true,
            title,
            message,
            type: 'error',
        });
    }, []);

    const hideErrorModal = useCallback(() => {
        setErrorModal(prev => ({ ...prev, visible: false }));
    }, []);

    const showSuccessModal = useCallback((title: string, message: string) => {
        setSuccessModal({
            visible: true,
            title,
            message,
        });
    }, []);

    const hideSuccessModal = useCallback(() => {
        setSuccessModal(prev => ({ ...prev, visible: false }));
    }, []);

    const onRefresh = useCallback(async () => {
        try {
            await refreshMutation.mutateAsync();
            showSuccessModal(
                'Actualisation réussie',
                'Les données du système ont été mises à jour avec succès.'
            );
        } catch (error) {
            console.error('Erreur refresh:', error);
            showErrorModal(
                'Erreur d\'actualisation',
                'Une erreur est survenue lors de l\'actualisation des données. Veuillez réessayer.'
            );
        }
    }, [refreshMutation, showSuccessModal, showErrorModal]);

    // Rendu d'une carte de statistique
    const renderStatCard = (
        title: string,
        value: string | number,
        icon: string,
        color: string,
        isLoading: boolean = false
    ) => (
        <View style={[
            styles.statCard,
            screenSize.isDesktop && styles.desktopStatCard,
            { backgroundColor: colors.surface, borderColor: colors.border }
        ]}>
            <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
                <Ionicons name={icon as any} size={screenSize.isDesktop ? 28 : 24} color={color} />
            </View>

            <View style={styles.statContent}>
                <Text variant="caption" color="textSecondary">
                    {title}
                </Text>
                {isLoading ? (
                    <Skeleton width="60%" height={screenSize.isDesktop ? 28 : 24} />
                ) : (
                    <Text
                        variant={screenSize.isDesktop ? "heading2" : "heading3"}
                        color="text"
                        weight="bold"
                    >
                        {value}
                    </Text>
                )}
            </View>
        </View>
    );

    // Rendu des informations système
    const renderSystemInfo = () => (
        <View style={[styles.section, screenSize.isDesktop && styles.desktopSection]}>
            <Text
                variant={screenSize.isDesktop ? "heading2" : "heading3"}
                color="text"
                style={styles.sectionTitle}
            >
                Informations Système
            </Text>

            <View style={[
                styles.infoCard,
                screenSize.isDesktop && styles.desktopInfoCard,
                { backgroundColor: colors.surface, borderColor: colors.border }
            ]}>
                <View style={[
                    styles.infoRow,
                    screenSize.isDesktop && styles.desktopInfoRow
                ]}>
                    <View style={styles.infoItem}>
                        <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                        <Text variant="body" color="text">Système opérationnel</Text>
                    </View>

                    {systemStatus?.multi_user_system && (
                        <View style={styles.infoItem}>
                            <Ionicons name="people" size={16} color={colors.primary} />
                            <Text variant="body" color="text">Multi-utilisateur</Text>
                        </View>
                    )}
                </View>

                {systemStatus?.admin_system && (
                    <View style={[
                        styles.infoRow,
                        screenSize.isDesktop && styles.desktopInfoRow
                    ]}>
                        <View style={styles.infoItem}>
                            <Ionicons name="shield-checkmark" size={16} color={colors.warning} />
                            <Text variant="body" color="text">Système admin actif</Text>
                        </View>
                    </View>
                )}
            </View>
        </View>
    );

    // Rendu des utilisateurs connectés
    const renderAuthenticatedUsers = () => (
        <View style={[styles.section, screenSize.isDesktop && styles.desktopSection]}>
            <View style={styles.sectionHeader}>
                <Text
                    variant={screenSize.isDesktop ? "heading2" : "heading3"}
                    color="text"
                >
                    Utilisateurs Connectés
                </Text>
                <Text variant="caption" color="textSecondary">
                    Temps réel
                </Text>
            </View>

            <View style={[
                styles.authUsersCard,
                screenSize.isDesktop && styles.desktopAuthUsersCard,
                { backgroundColor: colors.surface, borderColor: colors.border }
            ]}>
                {authLoading ? (
                    <View style={styles.authUsersLoading}>
                        <Skeleton width="100%" height={16} style={{ marginBottom: spacing.sm }} />
                        <Skeleton width="80%" height={14} />
                    </View>
                ) : authUsers && authUsers.authenticated_users.length > 0 ? (
                    <View style={[
                        styles.authUsersList,
                        screenSize.isDesktop && styles.desktopAuthUsersList
                    ]}>
                        {authUsers.authenticated_users.slice(0, screenSize.isDesktop ? 15 : 10).map((user, index) => (
                            <View key={user} style={[
                                styles.authUserItem,
                                screenSize.isDesktop && styles.desktopAuthUserItem
                            ]}>
                                <Ionicons name="person" size={14} color={colors.success} />
                                <Text variant="body" color="text">{user}</Text>
                                {index === 0 && (
                                    <View style={[styles.onlineBadge, { backgroundColor: colors.success }]}>
                                        <Text style={styles.onlineText}>En ligne</Text>
                                    </View>
                                )}
                            </View>
                        ))}

                        {authUsers.authenticated_users.length > (screenSize.isDesktop ? 15 : 10) && (
                            <Text variant="caption" color="textSecondary" style={styles.moreUsersText}>
                                +{authUsers.authenticated_users.length - (screenSize.isDesktop ? 15 : 10)} autres utilisateurs...
                            </Text>
                        )}
                    </View>
                ) : (
                    <View style={styles.noAuthUsers}>
                        <Ionicons name="person-outline" size={24} color={colors.textSecondary} />
                        <Text variant="body" color="textSecondary">
                            Aucun utilisateur connecté
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );

    // Rendu des actions rapides
    const renderQuickActions = () => (
        <View style={[styles.section, screenSize.isDesktop && styles.desktopSection]}>
            <Text
                variant={screenSize.isDesktop ? "heading2" : "heading3"}
                color="text"
                style={styles.sectionTitle}
            >
                Actions Rapides
            </Text>

            <View style={[
                styles.actionsContainer,
                screenSize.isDesktop && styles.desktopActionsContainer
            ]}>
                <Button
                    title="Actualiser les données"
                    onPress={onRefresh}
                    variant="outline"
                    size={screenSize.isDesktop ? "md" : "sm"}
                    disabled={isRefreshing}
                    loading={isRefreshing}
                    style={screenSize.isDesktop ? { minWidth: 200 } : { flex: 1 }}
                />

                {screenSize.isDesktop && (
                    <Button
                        title="Exporter les données"
                        onPress={() => {
                            showSuccessModal(
                                'Fonctionnalité à venir',
                                'L\'export des données sera disponible dans une prochaine mise à jour.'
                            );
                        }}
                        variant="primary"
                        size="md"
                        style={{ minWidth: 200 }}
                    />
                )}
            </View>
        </View>
    );

    // Gestion d'erreur avec modal personnalisée
    if (statusError) {
        return (
            <>
                <View style={[
                    styles.errorContainer,
                    screenSize.isDesktop && styles.desktopErrorContainer
                ]}>
                    <Ionicons name="alert-circle" size={48} color={colors.error} />
                    <Text variant="body" color="error" style={{ textAlign: 'center', marginTop: spacing.md }}>
                        Erreur lors du chargement du statut système
                    </Text>
                    <Button
                        title="Réessayer"
                        onPress={onRefresh}
                        variant="outline"
                        size="sm"
                        style={{ marginTop: spacing.md }}
                    />
                </View>

                {/* Modales d'erreur et de succès */}
                <ConfirmationModal
                    visible={errorModal.visible}
                    onClose={hideErrorModal}
                    title={errorModal.title}
                    message={errorModal.message}
                    confirmText="OK"
                    cancelText="Fermer"
                    onConfirm={hideErrorModal}
                    type={errorModal.type}
                />

                <SuccessModal
                    visible={successModal.visible}
                    onClose={hideSuccessModal}
                    title={successModal.title}
                    customMessage={successModal.message}
                    type="success"
                />
            </>
        );
    }

    return (
        <>
            <ScrollView
                style={styles.container}
                contentContainerStyle={[
                    styles.content,
                    screenSize.isDesktop && styles.desktopContent
                ]}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.primary}
                        colors={[colors.primary]}
                    />
                }
            >
                {/* Statistiques principales */}
                <View style={[styles.section, screenSize.isDesktop && styles.desktopSection]}>
                    <Text
                        variant={screenSize.isDesktop ? "heading2" : "heading3"}
                        color="text"
                        style={styles.sectionTitle}
                    >
                        Statistiques
                    </Text>

                    <View style={[
                        styles.statsGrid,
                        screenSize.isDesktop && styles.desktopStatsGrid
                    ]}>
                        {renderStatCard(
                            'Utilisateurs Enregistrés',
                            systemStatus?.total_registered_users ?? 0,
                            'people-outline',
                            colors.primary,
                            isLoading
                        )}

                        {renderStatCard(
                            'Utilisateurs Connectés',
                            authUsers?.total_authenticated ?? 0,
                            'people',
                            colors.success,
                            isLoading
                        )}

                        {renderStatCard(
                            'Administrateurs',
                            systemStatus?.total_admins ?? 0,
                            'shield-outline',
                            colors.warning,
                            isLoading
                        )}

                        {renderStatCard(
                            'Statut Système',
                            systemStatus?.system_status === 'operational' ? 'Opérationnel' : 'Indisponible',
                            systemStatus?.system_status === 'operational' ? 'checkmark-circle' : 'alert-circle',
                            systemStatus?.system_status === 'operational' ? colors.success : colors.error,
                            isLoading
                        )}
                    </View>
                </View>

                {/* Layout desktop avec colonnes */}
                {screenSize.isDesktop ? (
                    <View style={styles.desktopColumnsLayout}>
                        <View style={styles.desktopLeftColumn}>
                            {!isLoading && renderSystemInfo()}
                            {renderQuickActions()}
                        </View>
                        <View style={styles.desktopRightColumn}>
                            {renderAuthenticatedUsers()}
                        </View>
                    </View>
                ) : (
                    <>
                        {/* Informations système */}
                        {!isLoading && renderSystemInfo()}

                        {/* Utilisateurs connectés */}
                        {renderAuthenticatedUsers()}

                        {/* Actions rapides */}
                        {renderQuickActions()}
                    </>
                )}
            </ScrollView>

            {/* Modales */}
            <ConfirmationModal
                visible={errorModal.visible}
                onClose={hideErrorModal}
                title={errorModal.title}
                message={errorModal.message}
                confirmText="OK"
                cancelText="Fermer"
                onConfirm={hideErrorModal}
                type={errorModal.type}
            />

            <SuccessModal
                visible={successModal.visible}
                onClose={hideSuccessModal}
                title={successModal.title}
                customMessage={successModal.message}
                type="success"
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
        gap: spacing.xl,
    },

    // Styles communs
    section: {
        gap: spacing.lg,
    },
    sectionTitle: {
        marginBottom: spacing.sm,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },

    // Grille de statistiques
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
    },
    statCard: {
        flex: 1,
        minWidth: '45%',
        padding: spacing.lg,
        borderRadius: 12,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    statIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statContent: {
        flex: 1,
        gap: spacing.xs,
    },

    // Carte d'informations
    infoCard: {
        padding: spacing.lg,
        borderRadius: 12,
        borderWidth: 1,
        gap: spacing.md,
    },
    infoRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },

    // Utilisateurs connectés
    authUsersCard: {
        padding: spacing.lg,
        borderRadius: 12,
        borderWidth: 1,
        minHeight: 120,
    },
    authUsersLoading: {
        gap: spacing.sm,
    },
    authUsersList: {
        gap: spacing.sm,
    },
    authUserItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.xs,
    },
    onlineBadge: {
        paddingHorizontal: spacing.xs,
        paddingVertical: 2,
        borderRadius: 6,
        marginLeft: 'auto',
    },
    onlineText: {
        color: '#ffffff',
        fontSize: 10,
        fontFamily: 'Poppins_700Bold',
    },
    moreUsersText: {
        marginTop: spacing.sm,
        fontStyle: 'italic',
    },
    noAuthUsers: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.sm,
    },

    // Actions
    actionsContainer: {
        flexDirection: 'row',
        gap: spacing.sm,
    },

    // Erreur
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
    },

    // Styles desktop
    desktopContent: {
        padding: spacing.xl,
        gap: spacing.xl * 1.5,
        maxWidth: 1400,
        alignSelf: 'center',
        width: '100%',
    },

    desktopSection: {
        gap: spacing.xl,
    },

    desktopStatsGrid: {
        flexDirection: 'row',
        gap: spacing.lg,
        flexWrap: 'nowrap',
    },

    desktopStatCard: {
        minWidth: 250,
        padding: spacing.xl,
        gap: spacing.lg,
    },

    desktopInfoCard: {
        padding: spacing.xl,
    },

    desktopInfoRow: {
        gap: spacing.xl,
    },

    desktopAuthUsersCard: {
        padding: spacing.xl,
        minHeight: 300,
    },

    desktopAuthUsersList: {
        gap: spacing.md,
    },

    desktopAuthUserItem: {
        padding: spacing.sm,
        backgroundColor: 'rgba(0,0,0,0.02)',
        borderRadius: 8,
    },

    desktopActionsContainer: {
        flexDirection: 'row',
        gap: spacing.lg,
        justifyContent: 'flex-start',
    },

    desktopColumnsLayout: {
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

    desktopErrorContainer: {
        maxWidth: 600,
        alignSelf: 'center',
    },
});