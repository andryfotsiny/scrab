// src/features/admin/components/UsersList.tsx
import React, { useState, useCallback, useMemo } from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/shared/context/ThemeContext';
import { useAuth } from '@/src/shared/context/AuthContext';
import { useAllUsers, useAdminActions, useAdminPermissions } from '@/src/shared/hooks/admin/useAdminQueries';
import { UserWithRole } from '@/src/features/admin/types/admin.types';
import Text from '@/src/components/atoms/Text';
import Button from '@/src/components/atoms/Button';
import Input from '@/src/components/atoms/Input';
import Skeleton from '@/src/components/atoms/Skeleton';
import ConfirmationModal from '@/src/components/molecules/ConfirmationModal';
import SuccessModal from '@/src/components/molecules/SuccessModal';
import { spacing } from '@/src/styles';

interface UsersListProps {
    onUserSelect?: (user: UserWithRole) => void;
    showActions?: boolean;
    showModal?: (config: {
        title: string;
        message: string;
        onConfirm: () => void;
        type?: 'info' | 'warning' | 'success' | 'error';
    }) => void;
    hideModal?: () => void;
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

export default function UsersList({
                                      onUserSelect,
                                      showActions = true,
                                      showModal,
                                      hideModal
                                  }: UsersListProps) {
    const { colors } = useTheme();
    const { currentUserLogin } = useAuth();
    const { data: usersData, isLoading, error, refetch } = useAllUsers();
    const { promoteUser, demoteUser, isLoading: actionLoading } = useAdminActions();
    const permissions = useAdminPermissions();

    // États locaux
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin' | 'super_admin'>('all');
    const [refreshing, setRefreshing] = useState(false);

    // État des modales locales
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

    // Filtrage des utilisateurs
    const filteredUsers = useMemo(() => {
        if (!usersData?.users) return [];

        let filtered = usersData.users;

        // Filtre par recherche
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(user =>
                user.bet_login.toString().includes(query)
            );
        }

        // Filtre par rôle
        if (roleFilter !== 'all') {
            filtered = filtered.filter(user => user.role === roleFilter);
        }

        return filtered;
    }, [usersData?.users, searchQuery, roleFilter]);

    // Gestion du refresh
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await refetch();
        } finally {
            setRefreshing(false);
        }
    }, [refetch]);

    // Actions sur les utilisateurs
    const handlePromoteUser = useCallback(async (user: UserWithRole) => {
        if (!permissions.canPromote) {
            showErrorModal('Erreur', 'Vous n\'avez pas les permissions pour promouvoir un utilisateur');
            return;
        }

        showConfirmationModal({
            title: 'Promouvoir en administrateur',
            message: `Voulez-vous promouvoir l'utilisateur ${user.bet_login} au rang d'administrateur ?`,
            type: 'warning',
            onConfirm: async () => {
                setConfirmationModal(prev => ({ ...prev, loading: true }));

                try {
                    await promoteUser(user.bet_login.toString(), 'Promu via interface admin');
                    hideConfirmationModal();
                    showSuccessModal({
                        title: 'Promotion réussie',
                        message: `L'utilisateur ${user.bet_login} a été promu administrateur avec succès.`,
                    });
                } catch (error) {
                    setConfirmationModal(prev => ({ ...prev, loading: false }));
                    showErrorModal('Erreur de promotion', 'Une erreur est survenue lors de la promotion de l\'utilisateur.');
                    console.error('Erreur promotion:', error);
                }
            }
        });
    }, [permissions.canPromote, promoteUser, showConfirmationModal, hideConfirmationModal, showSuccessModal, showErrorModal]);

    const handleDemoteUser = useCallback(async (user: UserWithRole) => {
        if (!permissions.canDemote) {
            showErrorModal('Erreur', 'Vous n\'avez pas les permissions pour rétrograder un utilisateur');
            return;
        }

        // Empêcher l'auto-rétrogradation des super-admins
        if (user.is_super_admin) {
            showErrorModal('Erreur', 'Impossible de rétrograder un super-administrateur');
            return;
        }

        // Empêcher l'auto-rétrogradation
        if (user.bet_login.toString() === currentUserLogin) {
            showErrorModal('Erreur', 'Vous ne pouvez pas vous rétrograder vous-même');
            return;
        }

        showConfirmationModal({
            title: 'Rétrograder l\'administrateur',
            message: `Voulez-vous rétrograder l'administrateur ${user.bet_login} au rang d'utilisateur ? Cette action supprimera tous ses privilèges administrateur.`,
            type: 'error',
            onConfirm: async () => {
                setConfirmationModal(prev => ({ ...prev, loading: true }));

                try {
                    await demoteUser(user.bet_login.toString());
                    hideConfirmationModal();
                    showSuccessModal({
                        title: 'Rétrogradation réussie',
                        message: `L'administrateur ${user.bet_login} a été rétrogradé utilisateur avec succès.`,
                    });
                } catch (error) {
                    setConfirmationModal(prev => ({ ...prev, loading: false }));
                    showErrorModal('Erreur de rétrogradation', 'Une erreur est survenue lors de la rétrogradation de l\'utilisateur.');
                    console.error('Erreur rétrogradation:', error);
                }
            }
        });
    }, [permissions.canDemote, demoteUser, currentUserLogin, showConfirmationModal, hideConfirmationModal, showSuccessModal, showErrorModal]);

    // Rendu d'un utilisateur
    const renderUser = useCallback(({ item: user }: { item: UserWithRole }) => {
        const isCurrentUser = user.bet_login.toString() === currentUserLogin;
        const canPromote = !user.is_admin && permissions.canPromote;
        const canDemote = user.is_admin && !user.is_super_admin && !isCurrentUser && permissions.canDemote;

        return (
            <TouchableOpacity
                style={[styles.userCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => onUserSelect?.(user)}
                activeOpacity={0.7}
            >
                <View style={styles.userHeader}>
                    <View style={styles.userInfo}>
                        <Text variant="body" weight="bold" color="text">
                            {user.bet_login}
                        </Text>
                        {isCurrentUser && (
                            <View style={[styles.currentUserBadge, { backgroundColor: colors.primary }]}>
                                <Text style={styles.currentUserText}>Vous</Text>
                            </View>
                        )}
                    </View>

                    <View style={[styles.roleBadge, { backgroundColor: getRoleColor(user.role, colors) }]}>
                        <Text style={styles.roleText}>
                            {getRoleLabel(user.role)}
                        </Text>
                    </View>
                </View>

                <View style={styles.userDetails}>
                    <View style={styles.detailRow}>
                        <Ionicons
                            name="calendar-outline"
                            size={14}
                            color={colors.textSecondary}
                        />
                        <Text variant="caption" color="textSecondary">
                            Créé le {new Date(user.created_at).toLocaleDateString('fr-FR')}
                        </Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Ionicons
                            name={user.status_payant ? "diamond" : "gift-outline"}
                            size={14}
                            color={user.status_payant ? colors.warning : colors.textSecondary}
                        />
                        <Text variant="caption" color="textSecondary">
                            {user.status_payant ? 'Payant' : `Gratuit (${user.dure_gratuit}j)`}
                        </Text>
                    </View>
                </View>

                {showActions && (canPromote || canDemote) && (
                    <View style={styles.actionButtons}>
                        {canPromote && (
                            <Button
                                title="Promouvoir"
                                onPress={() => handlePromoteUser(user)}
                                variant="outline"
                                size="sm"
                                disabled={actionLoading}
                                style={{ flex: 1 }}
                            />
                        )}

                        {canDemote && (
                            <Button
                                title="Rétrograder"
                                onPress={() => handleDemoteUser(user)}
                                variant="outline"
                                size="sm"
                                disabled={actionLoading}
                                style={[
                                    { flex: 1 },
                                    { borderColor: colors.error }
                                ]}
                                textStyle={{ color: colors.error }}
                            />
                        )}
                    </View>
                )}
            </TouchableOpacity>
        );
    }, [colors, currentUserLogin, permissions, showActions, actionLoading, onUserSelect, handlePromoteUser, handleDemoteUser]);

    // Rendu du skeleton
    const renderSkeleton = useCallback(() => (
        <View style={[styles.userCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.userHeader}>
                <Skeleton width="30%" height={18} />
                <Skeleton width={60} height={24} borderRadius={12} />
            </View>
            <View style={styles.userDetails}>
                <Skeleton width="60%" height={14} />
                <Skeleton width="40%" height={14} />
            </View>
        </View>
    ), [colors]);

    // Rendu des filtres
    const renderFilters = () => (
        <View style={styles.filtersContainer}>
            <Input
                placeholder="Rechercher par numéro..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchInput}
                leftIcon="search"
            />

            <View style={styles.roleFilters}>
                {(['all', 'user', 'admin', 'super_admin'] as const).map((role) => (
                    <TouchableOpacity
                        key={role}
                        style={[
                            styles.filterChip,
                            {
                                backgroundColor: roleFilter === role ? colors.primary : colors.surface,
                                borderColor: roleFilter === role ? colors.primary : colors.border,
                            }
                        ]}
                        onPress={() => setRoleFilter(role)}
                    >
                        <Text
                            variant="caption"
                            color={roleFilter === role ? "surface" : "text"}
                            weight={roleFilter === role ? "bold" : "regular"}
                        >
                            {role === 'all' ? 'Tous' : getRoleLabel(role)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={48} color={colors.error} />
                <Text variant="body" color="error" style={{ textAlign: 'center', marginTop: spacing.md }}>
                    Erreur lors du chargement des utilisateurs
                </Text>
                <Button
                    title="Réessayer"
                    onPress={() => refetch()}
                    variant="outline"
                    size="sm"
                    style={{ marginTop: spacing.md }}
                />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {renderFilters()}

            <View style={styles.statsContainer}>
                <Text variant="caption" color="textSecondary">
                    {filteredUsers.length} utilisateur{filteredUsers.length !== 1 ? 's' : ''} trouvé{filteredUsers.length !== 1 ? 's' : ''}
                    {usersData && ` sur ${usersData.total_users} total`}
                </Text>
            </View>

            <FlatList
                data={isLoading ? Array(5).fill(null) : filteredUsers}
                renderItem={isLoading ? renderSkeleton : renderUser}
                keyExtractor={(item, index) =>
                    isLoading ? `skeleton-${index}` : item.bet_login.toString()
                }
                contentContainerStyle={styles.listContainer}
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
                            <Ionicons name="people-outline" size={48} color={colors.textSecondary} />
                            <Text variant="body" color="textSecondary" style={{ textAlign: 'center' }}>
                                Aucun utilisateur trouvé
                            </Text>
                        </View>
                    ) : null
                }
            />

            {/* Modales de confirmation et succès */}
            <ConfirmationModal
                visible={confirmationModal.visible}
                onClose={hideConfirmationModal}
                title={confirmationModal.title}
                message={confirmationModal.message}
                confirmText={confirmationModal.type === 'error' ? 'Rétrograder' : 'Promouvoir'}
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

// Fonctions utilitaires
const getRoleColor = (role: string, colors: any) => {
    switch (role) {
        case 'super_admin': return colors.error;
        case 'admin': return colors.warning;
        default: return colors.textSecondary;
    }
};

const getRoleLabel = (role: string) => {
    switch (role) {
        case 'super_admin': return 'Super Admin';
        case 'admin': return 'Admin';
        default: return 'Utilisateur';
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    filtersContainer: {
        padding: spacing.lg,
        gap: spacing.md,
    },
    searchInput: {
        marginBottom: spacing.sm,
    },
    roleFilters: {
        flexDirection: 'row',
        gap: spacing.sm,
        flexWrap: 'wrap',
    },
    filterChip: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: 16,
        borderWidth: 1,
    },
    statsContainer: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.sm,
    },
    listContainer: {
        padding: spacing.lg,
        paddingTop: 0,
        gap: spacing.md,
    },
    userCard: {
        padding: spacing.lg,
        borderRadius: 12,
        borderWidth: 1,
        gap: spacing.md,
    },
    userHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    currentUserBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: 8,
    },
    currentUserText: {
        color: '#ffffff',
        fontSize: 10,
        fontFamily: 'Poppins_700Bold',
    },
    roleBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: 12,
    },
    roleText: {
        color: '#ffffff',
        fontSize: 12,
        fontFamily: 'Poppins_700Bold',
    },
    userDetails: {
        gap: spacing.xs,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginTop: spacing.sm,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
    },
    emptyContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
        gap: spacing.md,
    },
});