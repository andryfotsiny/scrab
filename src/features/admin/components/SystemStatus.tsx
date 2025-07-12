// src/features/admin/components/SystemStatus.tsx
import React, { useCallback, useState } from 'react';
import {
    View,
    StyleSheet,
    RefreshControl,
    ScrollView,
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

export default function SystemStatus() {
    const { colors } = useTheme();
    const { data: systemStatus, isLoading: statusLoading, error: statusError } = useSystemStatus();
    const { data: authUsers, isLoading: authLoading } = useAuthenticatedUsers();
    const refreshMutation = useRefreshAdminData();

    const isLoading = statusLoading || authLoading;
    const isRefreshing = refreshMutation.isPending;

    // États pour les modales
    const [errorModal, setErrorModal] = useState<ModalState>({
        visible: false,
        title: '',
        message: '',
        type: 'error',
    });

    const [successModal, setSuccessModal] = useState<ModalState>({
        visible: false,
        title: '',
        message: '',
        type: 'success',
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
            type: 'success',
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

    const renderStatCard = (
        title: string,
        value: string | number,
        icon: string,
        color: string,
        isLoading: boolean = false
    ) => (
        <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
                <Ionicons name={icon as any} size={24} color={color} />
            </View>

            <View style={styles.statContent}>
                <Text variant="caption" color="textSecondary">
                    {title}
                </Text>
                {isLoading ? (
                    <Skeleton width="60%" height={24} />
                ) : (
                    <Text variant="heading3" color="text" weight="bold">
                        {value}
                    </Text>
                )}
            </View>
        </View>
    );

    const renderSystemInfo = () => (
        <View style={styles.section}>
            <Text variant="heading3" color="text" style={styles.sectionTitle}>
                Informations Système
            </Text>

            <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.infoRow}>
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
                    <View style={styles.infoRow}>
                        <View style={styles.infoItem}>
                            <Ionicons name="shield-checkmark" size={16} color={colors.warning} />
                            <Text variant="body" color="text">Système admin actif</Text>
                        </View>
                    </View>
                )}
            </View>
        </View>
    );

    const renderAuthenticatedUsers = () => (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text variant="heading3" color="text">
                    Utilisateurs Connectés
                </Text>
                <Text variant="caption" color="textSecondary">
                    Temps réel
                </Text>
            </View>

            <View style={[styles.authUsersCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                {authLoading ? (
                    <View style={styles.authUsersLoading}>
                        <Skeleton width="100%" height={16} style={{ marginBottom: spacing.sm }} />
                        <Skeleton width="80%" height={14} />
                    </View>
                ) : authUsers && authUsers.authenticated_users.length > 0 ? (
                    <View style={styles.authUsersList}>
                        {authUsers.authenticated_users.slice(0, 10).map((user, index) => (
                            <View key={user} style={styles.authUserItem}>
                                <Ionicons name="person" size={14} color={colors.success} />
                                <Text variant="body" color="text">{user}</Text>
                                {index === 0 && (
                                    <View style={[styles.onlineBadge, { backgroundColor: colors.success }]}>
                                        <Text style={styles.onlineText}>En ligne</Text>
                                    </View>
                                )}
                            </View>
                        ))}

                        {authUsers.authenticated_users.length > 10 && (
                            <Text variant="caption" color="textSecondary" style={styles.moreUsersText}>
                                +{authUsers.authenticated_users.length - 10} autres utilisateurs...
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

    // Gestion d'erreur avec modal personnalisée
    if (statusError) {
        return (
            <>
                <View style={styles.errorContainer}>
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

                {/* Modal d'erreur */}
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

                {/* Modal de succès */}
                <SuccessModal
                    visible={successModal.visible}
                    onClose={hideSuccessModal}
                    title={successModal.title}
                    customMessage={successModal.message}
                    type={successModal.type}
                />
            </>
        );
    }

    return (
        <>
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.content}
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
                <View style={styles.section}>
                    <Text variant="heading3" color="text" style={styles.sectionTitle}>
                        Statistiques
                    </Text>

                    <View style={styles.statsGrid}>
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

                {/* Informations système */}
                {!isLoading && renderSystemInfo()}

                {/* Utilisateurs connectés */}
                {renderAuthenticatedUsers()}

                {/* Actions rapides */}
                <View style={styles.section}>
                    <Text variant="heading3" color="text" style={styles.sectionTitle}>
                        Actions Rapides
                    </Text>

                    <View style={styles.actionsContainer}>
                        <Button
                            title="Actualiser les données"
                            onPress={onRefresh}
                            variant="outline"
                            size="sm"
                            disabled={isRefreshing}
                            loading={isRefreshing}
                            style={{ flex: 1 }}
                        />
                    </View>
                </View>
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
                type={successModal.type}
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
    actionsContainer: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
    },
});