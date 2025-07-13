// src/features/admin/components/SubscriptionsList.tsx - COMPOSANT PRINCIPAL

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Dimensions, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/shared/context/ThemeContext';
import { useAuth } from '@/src/shared/context/AuthContext';
import {
    useAllUsersSubscriptionStatus,
    useSubscriptionActions,
    useSubscriptionPermissions
} from '@/src/shared/hooks/subscription/useSubscriptionQueries';
import { subscriptionService } from '@/src/shared/services/api/subscription/subscription.api';
import Text from '@/src/components/atoms/Text';
import Button from '@/src/components/atoms/Button';
import ConfirmationModal from '@/src/components/molecules/ConfirmationModal';
import SuccessModal from '@/src/components/molecules/SuccessModal';
import { spacing } from '@/src/styles';

// Imports des sous-composants
import SubscriptionFilters from './SubscriptionsList/SubscriptionFilters';
import SubscriptionStats from './SubscriptionsList/SubscriptionStats';
import SubscriptionMobileCard from './SubscriptionsList/SubscriptionMobileCard';
import SubscriptionDesktopRow from './SubscriptionsList/SubscriptionDesktopRow';
import SubscriptionTableHeader from './SubscriptionsList/SubscriptionTableHeader';
import ExtendTrialModal from './SubscriptionsList/ExtendTrialModal';

// Types et interfaces (gardés ici car utilisés dans plusieurs composants)
interface SubscriptionsListProps {
    showModal?: (config: {
        title: string;
        message: string;
        onConfirm: () => void;
        type?: 'info' | 'warning' | 'success' | 'error';
    }) => void;
    hideModal?: () => void;
}

export interface UserSubscription {
    user: string;
    account_type: 'gratuit' | 'payant';
    status_payant: boolean;
    access_level: 'complet' | 'limite';
    trial_status: 'non_demarre' | 'actif' | 'expire' | 'non_applicable';
    days_remaining: number | null;
    created_at: string;
    can_use_premium_features: boolean;
    display_info: {
        label: string;
        color: string;
        description: string;
        icon: string;
    };
    available_actions: {
        canActivatePaid: boolean;
        canDeactivatePaid: boolean;
        canExtendTrial: boolean;
    };
}

interface ExtendTrialModalState {
    visible: boolean;
    user: UserSubscription | null;
    days: string;
    notes: string;
    loading: boolean;
}

interface ConfirmationState {
    visible: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: 'warning' | 'error';
    loading: boolean;
}

interface SuccessState {
    visible: boolean;
    title: string;
    message: string;
}

// Hook responsive (gardé ici car spécifique à ce composant)
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

export default function SubscriptionsList({
                                              showModal,
                                              hideModal
                                          }: SubscriptionsListProps) {
    const { colors } = useTheme();
    const { currentUserLogin, userRole } = useAuth();
    const screenSize = useScreenSize();

    // Hooks React Query
    const { data: subscriptionData, isLoading, error, refetch } = useAllUsersSubscriptionStatus();
    const { activatePaid, deactivatePaid, extendTrial, isLoading: actionLoading } = useSubscriptionActions();
    const subscriptionPermissions = useSubscriptionPermissions(userRole);

    // États locaux
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'payant' | 'gratuit' | 'expire' | 'non_demarre'>('all');
    const [refreshing, setRefreshing] = useState(false);

    // États des modales
    const [extendTrialModal, setExtendTrialModal] = useState<ExtendTrialModalState>({
        visible: false,
        user: null,
        days: '7',
        notes: '',
        loading: false,
    });

    const [confirmationModal, setConfirmationModal] = useState<ConfirmationState>({
        visible: false,
        title: '',
        message: '',
        onConfirm: () => {},
        type: 'warning',
        loading: false,
    });

    const [successModal, setSuccessModal] = useState<SuccessState>({
        visible: false,
        title: '',
        message: '',
    });

    // Calculs dérivés
    const usersWithSubscriptionInfo = useMemo(() => {
        if (!subscriptionData?.data?.users) return [];

        return subscriptionData.data.users.map(user => {
            const displayInfo = subscriptionService.formatSubscriptionStatus(user);
            const availableActions = subscriptionService.getAvailableActions(
                user,
                user.user === currentUserLogin,
                subscriptionPermissions
            );

            return {
                ...user,
                display_info: displayInfo,
                available_actions: availableActions,
            } as UserSubscription;
        });
    }, [subscriptionData?.data?.users, currentUserLogin, subscriptionPermissions]);

    // Filtrage des abonnements
    const filteredSubscriptions = useMemo(() => {
        let filtered = usersWithSubscriptionInfo;

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(user =>
                user.user.toString().includes(query)
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(user => {
                switch (statusFilter) {
                    case 'payant':
                        return user.status_payant;
                    case 'gratuit':
                        return !user.status_payant && user.trial_status === 'actif';
                    case 'expire':
                        return !user.status_payant && user.trial_status === 'expire';
                    case 'non_demarre':
                        return !user.status_payant && user.trial_status === 'non_demarre';
                    default:
                        return true;
                }
            });
        }

        return filtered;
    }, [usersWithSubscriptionInfo, searchQuery, statusFilter]);

    // Fonctions helper pour les modales
    const showConfirmationModal = useCallback((config: Omit<ConfirmationState, 'visible' | 'loading'>) => {
        setConfirmationModal({
            visible: true,
            loading: false,
            ...config,
        });
    }, []);

    const hideConfirmationModal = useCallback(() => {
        setConfirmationModal(prev => ({ ...prev, visible: false }));
    }, []);

    const showSuccessModal = useCallback((config: Omit<SuccessState, 'visible'>) => {
        setSuccessModal({
            visible: true,
            ...config,
        });
    }, []);

    const hideSuccessModal = useCallback(() => {
        setSuccessModal(prev => ({ ...prev, visible: false }));
    }, []);

    const showErrorModal = useCallback((title: string, message: string) => {
        if (showModal) {
            showModal({
                title,
                message,
                type: 'error',
                onConfirm: () => hideModal?.(),
            });
        }
    }, [showModal, hideModal]);

    // Gestion du refresh
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await refetch();
        } finally {
            setRefreshing(false);
        }
    }, [refetch]);

    // Actions d'abonnement
    const handleActivatePaid = useCallback(async (user: UserSubscription) => {
        if (!subscriptionPermissions.canActivatePaid) {
            showErrorModal('Erreur', 'Vous n\'avez pas les permissions pour activer le mode payant');
            return;
        }

        showConfirmationModal({
            title: 'Activer le mode payant',
            message: `Voulez-vous activer le mode payant pour l'utilisateur ${user.user} ?\n\nCela donnera un accès illimité à toutes les fonctionnalités premium.`,
            type: 'warning',
            onConfirm: async () => {
                setConfirmationModal(prev => ({ ...prev, loading: true }));

                try {
                    await activatePaid(user.user, 'Activé via interface admin');
                    hideConfirmationModal();
                    showSuccessModal({
                        title: 'Mode payant activé',
                        message: `Le mode payant a été activé avec succès pour l'utilisateur ${user.user}.`,
                    });
                } catch (error) {
                    setConfirmationModal(prev => ({ ...prev, loading: false }));
                    showErrorModal('Erreur d\'activation', 'Une erreur est survenue lors de l\'activation du mode payant.');
                    console.error('Erreur activation:', error);
                }
            }
        });
    }, [subscriptionPermissions.canActivatePaid, activatePaid, showConfirmationModal, hideConfirmationModal, showSuccessModal, showErrorModal]);

    const handleDeactivatePaid = useCallback(async (user: UserSubscription) => {
        if (!subscriptionPermissions.canDeactivatePaid) {
            showErrorModal('Erreur', 'Vous n\'avez pas les permissions pour désactiver le mode payant');
            return;
        }

        if (user.user === currentUserLogin) {
            showErrorModal('Erreur', 'Vous ne pouvez pas désactiver votre propre mode payant');
            return;
        }

        showConfirmationModal({
            title: 'Désactiver le mode payant',
            message: `Voulez-vous désactiver le mode payant pour l'utilisateur ${user.user} ?\n\n⚠️ Attention : Cette action ramènera l'utilisateur en mode gratuit avec période expirée (accès limité).`,
            type: 'error',
            onConfirm: async () => {
                setConfirmationModal(prev => ({ ...prev, loading: true }));

                try {
                    await deactivatePaid(user.user, 'Désactivé via interface admin');
                    await new Promise(resolve => setTimeout(resolve, 500));
                    hideConfirmationModal();
                    showSuccessModal({
                        title: 'Mode payant désactivé',
                        message: `Le mode payant a été désactivé pour l'utilisateur ${user.user}.`,
                    });
                } catch (error) {
                    setConfirmationModal(prev => ({ ...prev, loading: false }));
                    showErrorModal('Erreur de désactivation', 'Une erreur est survenue lors de la désactivation du mode payant.');
                    console.error('Erreur désactivation:', error);
                }
            }
        });
    }, [subscriptionPermissions.canDeactivatePaid, deactivatePaid, currentUserLogin, showConfirmationModal, hideConfirmationModal, showSuccessModal, showErrorModal]);

    const handleExtendTrial = useCallback((user: UserSubscription) => {
        if (!subscriptionPermissions.canExtendTrial) {
            showErrorModal('Erreur', 'Vous n\'avez pas les permissions pour prolonger la période gratuite');
            return;
        }

        setExtendTrialModal({
            visible: true,
            user,
            days: '7',
            notes: '',
            loading: false,
        });
    }, [subscriptionPermissions.canExtendTrial, showErrorModal]);

    const handleConfirmExtendTrial = useCallback(async () => {
        if (!extendTrialModal.user) return;

        const days = parseInt(extendTrialModal.days);
        if (isNaN(days) || days <= 0) {
            Alert.alert('Erreur', 'Veuillez entrer un nombre de jours valide');
            return;
        }

        if (days > 365) {
            Alert.alert('Erreur', 'Maximum 365 jours d\'extension autorisés');
            return;
        }

        setExtendTrialModal(prev => ({ ...prev, loading: true }));

        try {
            await extendTrial(
                extendTrialModal.user.user,
                days,
                extendTrialModal.notes || 'Prolongation via interface admin'
            );

            setExtendTrialModal({
                visible: false,
                user: null,
                days: '7',
                notes: '',
                loading: false,
            });

            showSuccessModal({
                title: 'Période gratuite prolongée',
                message: `La période gratuite a été prolongée de ${days} jour(s) pour l'utilisateur ${extendTrialModal.user.user}.`,
            });
        } catch (error) {
            setExtendTrialModal(prev => ({ ...prev, loading: false }));
            showErrorModal('Erreur de prolongation', 'Une erreur est survenue lors de la prolongation de la période gratuite.');
            console.error('Erreur extension:', error);
        }
    }, [extendTrialModal, extendTrial, showSuccessModal, showErrorModal]);

    // Gestion d'erreur
    if (error) {
        return (
            <View style={[
                styles.errorContainer,
                screenSize.isDesktop && styles.desktopErrorContainer
            ]}>
                <Ionicons name="alert-circle" size={48} color={colors.error} />
                <Text variant="body" color="error" style={{ textAlign: 'center', marginTop: spacing.md }}>
                    Erreur lors du chargement des abonnements
                </Text>
                <Button
                    title="Réessayer"
                    onPress={() => onRefresh()}
                    variant="outline"
                    size="sm"
                    style={{ marginTop: spacing.md }}
                />
            </View>
        );
    }

    // Rendu principal
    return (
        <View style={styles.container}>
            {/* Filtres */}
            <SubscriptionFilters
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                screenSize={screenSize}
            />

            {/* Statistiques d'abonnement */}
            <SubscriptionStats
                statistics={subscriptionData?.data?.statistics}
            />

            {/* Compteur de résultats */}
            <View style={styles.resultsContainer}>
                <Text variant="caption" color="textSecondary">
                    {filteredSubscriptions.length} abonnement{filteredSubscriptions.length !== 1 ? 's' : ''} trouvé{filteredSubscriptions.length !== 1 ? 's' : ''}
                    {subscriptionData?.data && ` sur ${subscriptionData.data.statistics.total_users} total`}
                </Text>
            </View>

            {screenSize.isDesktop ? (
                // Vue desktop - Format tableau
                <View style={styles.desktopTableContainer}>
                    <SubscriptionTableHeader />
                    <FlatList
                        data={filteredSubscriptions}
                        renderItem={({ item }) => (
                            <SubscriptionDesktopRow
                                user={item}
                                currentUserLogin={currentUserLogin}
                                actionLoading={actionLoading}
                                onActivatePaid={handleActivatePaid}
                                onDeactivatePaid={handleDeactivatePaid}
                                onExtendTrial={handleExtendTrial}
                            />
                        )}
                        keyExtractor={(item) => item.user}
                        contentContainerStyle={styles.desktopListContainer}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                tintColor={colors.primary}
                                colors={[colors.primary]}
                            />
                        }
                        ListEmptyComponent={
                            !isLoading ? (
                                <View style={styles.emptyContainer}>
                                    <Ionicons name="card-outline" size={48} color={colors.textSecondary} />
                                    <Text variant="body" color="textSecondary" style={{ textAlign: 'center' }}>
                                        Aucun abonnement trouvé
                                    </Text>
                                </View>
                            ) : null
                        }
                    />
                </View>
            ) : (
                // Vue mobile - Format cartes
                <FlatList
                    data={filteredSubscriptions}
                    renderItem={({ item }) => (
                        <SubscriptionMobileCard
                            user={item}
                            currentUserLogin={currentUserLogin}
                            actionLoading={actionLoading}
                            onActivatePaid={handleActivatePaid}
                            onDeactivatePaid={handleDeactivatePaid}
                            onExtendTrial={handleExtendTrial}
                        />
                    )}
                    keyExtractor={(item) => item.user}
                    contentContainerStyle={styles.mobileListContainer}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={colors.primary}
                            colors={[colors.primary]}
                        />
                    }
                    ListEmptyComponent={
                        !isLoading ? (
                            <View style={styles.emptyContainer}>
                                <Ionicons name="card-outline" size={48} color={colors.textSecondary} />
                                <Text variant="body" color="textSecondary" style={{ textAlign: 'center' }}>
                                    Aucun abonnement trouvé
                                </Text>
                            </View>
                        ) : null
                    }
                />
            )}

            {/* Modales */}
            <ExtendTrialModal
                visible={extendTrialModal.visible}
                user={extendTrialModal.user}
                days={extendTrialModal.days}
                notes={extendTrialModal.notes}
                loading={extendTrialModal.loading}
                onClose={() => setExtendTrialModal({ visible: false, user: null, days: '7', notes: '', loading: false })}
                onDaysChange={(value) => setExtendTrialModal(prev => ({ ...prev, days: value }))}
                onNotesChange={(value) => setExtendTrialModal(prev => ({ ...prev, notes: value }))}
                onConfirm={handleConfirmExtendTrial}
            />

            <ConfirmationModal
                visible={confirmationModal.visible}
                onClose={hideConfirmationModal}
                title={confirmationModal.title}
                message={confirmationModal.message}
                confirmText={confirmationModal.type === 'error' ? 'Confirmer' : 'Confirmer'}
                cancelText="Annuler"
                onConfirm={confirmationModal.onConfirm}
                type={confirmationModal.type}
                loading={confirmationModal.loading}
                confirmButtonVariant={confirmationModal.type === 'error' ? 'outline' : 'primary'}
            />

            <SuccessModal
                visible={successModal.visible}
                onClose={hideSuccessModal}
                title={successModal.title}
                customMessage={successModal.message}
                type="success"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    resultsContainer: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.sm,
    },
    desktopTableContainer: {
        flex: 1,
    },
    desktopListContainer: {
        paddingBottom: spacing.lg,
    },
    mobileListContainer: {
        padding: spacing.lg,
        paddingTop: 0,
        gap: spacing.md,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
    },
    desktopErrorContainer: {
        maxWidth: 600,
        alignSelf: 'center',
    },
    emptyContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
        gap: spacing.md,
    },
});