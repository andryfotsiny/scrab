// src/features/auth/components/UserProfileScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    StyleSheet,
    StatusBar,
    ScrollView,
    RefreshControl,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/src/shared/context/ThemeContext';
import { useAuth } from '@/src/shared/context/AuthContext';
import ThemeToggle from '@/src/components/atoms/ThemeToggle';
import Button from '@/src/components/atoms/Button';
import Text from '@/src/components/atoms/Text';
import Skeleton from '@/src/components/atoms/Skeleton';
import ConfirmationModal from '@/src/components/molecules/ConfirmationModal';
import SuccessModal from '@/src/components/molecules/SuccessModal';
import { spacing } from '@/src/styles';

export default function UserProfileScreen() {
    const { colors, mode } = useTheme();
    const insets = useSafeAreaInsets();
    const {
        loading,
        localUserInfo,
        bet261UserData,
        isAuthenticated,
        currentUserLogin,
        refreshUserInfo,
        logout
    } = useAuth();

    const [initialLoading, setInitialLoading] = useState(true);

    // Modal states
    const [showRefreshErrorModal, setShowRefreshErrorModal] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showSwitchUserModal, setShowSwitchUserModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [modalData, setModalData] = useState({
        title: '',
        message: '',
        type: 'info' as 'success' | 'info',
    });

    // Debug logs
    useEffect(() => {
        console.log('🔍 UserProfileScreen state:', {
            isAuthenticated,
            hasLocalUserInfo: !!localUserInfo,
            hasBet261UserData: !!bet261UserData,
            loading,
            currentUserLogin
        });
    }, [isAuthenticated, localUserInfo, bet261UserData, loading, currentUserLogin]);

    useEffect(() => {
        // Initial loading is done when we have data or after first render
        if (localUserInfo && bet261UserData) {
            setInitialLoading(false);
        } else if (!loading && isAuthenticated) {
            // If authenticated but no data, try to refresh
            const loadData = async () => {
                try {
                    await refreshUserInfo();
                } catch (err) {
                    console.error('Failed to load user data:', err);
                } finally {
                    setInitialLoading(false);
                }
            };
            loadData();
        } else if (!loading) {
            // If not loading and no data, probably not authenticated
            setInitialLoading(false);
        }
    }, [localUserInfo, bet261UserData, loading, isAuthenticated, refreshUserInfo]);

    const onRefresh = useCallback(async () => {
        // Try to refresh even if isAuthenticated is false but we have user data
        if (!isAuthenticated && !localUserInfo && !bet261UserData) {
            setModalData({
                title: 'Erreur',
                message: 'Vous devez vous connecter pour actualiser les données',
                type: 'info',
            });
            setShowRefreshErrorModal(true);
            return;
        }

        try {
            await refreshUserInfo();
            setModalData({
                title: 'Données actualisées',
                message: 'Vos informations ont été mises à jour avec succès.',
                type: 'success',
            });
            setShowSuccessModal(true);
        } catch (err) {
            console.error('❌ Refresh error:', err);
            setModalData({
                title: 'Erreur',
                message: 'Impossible d\'actualiser les données',
                type: 'info',
            });
            setShowRefreshErrorModal(true);
        }
    }, [isAuthenticated, localUserInfo, bet261UserData, refreshUserInfo]);

    const handleLogout = useCallback(async () => {
        setShowLogoutModal(true);
    }, []);

    const handleConfirmLogout = useCallback(async () => {
        setShowLogoutModal(false);
        try {
            await logout();
            router.replace('/(auth)/login');
        } catch (error) {
            console.error('Logout error:', error);
            // Navigate anyway since local state is cleared
            router.replace('/(auth)/login');
        }
    }, [logout]);

    const handleSwitchUser = useCallback(() => {
        setShowSwitchUserModal(true);
    }, []);

    const handleConfirmSwitchUser = useCallback(async () => {
        setShowSwitchUserModal(false);
        try {
            await logout();
            router.replace('/(auth)/login');
        } catch (error) {
            console.error('Switch user error:', error);
            router.replace('/(auth)/login');
        }
    }, [logout]);

    const formatBalance = useCallback((balance: number) => {
        return new Intl.NumberFormat('mg-MG', {
            style: 'currency',
            currency: 'MGA',
        }).format(balance);
    }, []);

    const formatDate = useCallback((dateString: string) => {
        return new Date(dateString).toLocaleString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }, []);

    const getStatusColor = (state: number) => {
        switch (state) {
            case 1: return colors.success;
            case 0: return colors.warning;
            default: return colors.error;
        }
    };

    const getStatusText = (state: number) => {
        switch (state) {
            case 1: return 'Actif';
            case 0: return 'Inactif';
            default: return 'Suspendu';
        }
    };

    const renderSkeletonContent = () => (
        <>
            {/* User Info Section Skeleton */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Skeleton width="50%" height={24} />
                    <Skeleton width={60} height={28} borderRadius={14} />
                </View>

                <View style={styles.infoGrid}>
                    <View style={styles.infoItem}>
                        <Skeleton width="40%" height={14} />
                        <Skeleton width="70%" height={18} />
                    </View>
                    <View style={styles.infoItem}>
                        <Skeleton width="35%" height={14} />
                        <Skeleton width="60%" height={18} />
                    </View>
                    <View style={styles.infoItem}>
                        <Skeleton width="45%" height={14} />
                        <Skeleton width="80%" height={18} />
                    </View>
                </View>
            </View>

            {/* Separator */}
            <View style={[styles.separator, { backgroundColor: colors.border }]} />

            {/* Balance Section Skeleton */}
            <View style={styles.section}>
                <Skeleton width="30%" height={24} style={{ marginBottom: spacing.lg }} />

                <View style={styles.balanceGrid}>
                    <View style={styles.balanceItem}>
                        <Skeleton width="60%" height={14} />
                        <Skeleton width="80%" height={32} />
                    </View>
                    <View style={styles.balanceItem}>
                        <Skeleton width="50%" height={14} />
                        <Skeleton width="70%" height={20} />
                    </View>
                    <View style={styles.balanceItem}>
                        <Skeleton width="65%" height={14} />
                        <Skeleton width="60%" height={20} />
                    </View>
                </View>
            </View>

            {/* Separator */}
            <View style={[styles.separator, { backgroundColor: colors.border }]} />

            {/* Actions Section */}
            <View style={styles.section}>
                <Skeleton width="30%" height={24} style={{ marginBottom: spacing.lg }} />

                <View style={styles.actionButtons}>
                    <Button
                        title="Actualiser"
                        onPress={() => {}}
                        variant="outline"
                        size="sm"
                        disabled={true}
                        style={{ flex: 1 }}
                    />
                    <Button
                        title="Changer d'utilisateur"
                        onPress={() => {}}
                        variant="outline"
                        size="sm"
                        disabled={true}
                        style={{ flex: 1 }}
                    />
                </View>

                <Button
                    title="Se déconnecter"
                    onPress={() => {}}
                    variant="outline"
                    size="sm"
                    disabled={true}
                    style={{ marginTop: spacing.sm }}
                />
            </View>
        </>
    );

    const renderContent = () => (
        <>
            {/* User Information Section */}
            {bet261UserData && (
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text variant="heading3" color="text">
                            Informations utilisateur
                        </Text>
                        <View style={[
                            styles.statusBadge,
                            { backgroundColor: getStatusColor(bet261UserData.bet261_user_data.state) }
                        ]}>
                            <Text style={styles.statusText}>
                                {getStatusText(bet261UserData.bet261_user_data.state)}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.infoGrid}>
                        <View style={styles.infoItem}>
                            <Text variant="caption" color="textSecondary">
                                Login
                            </Text>
                            <Text variant="body" weight="bold" color="text">
                                {bet261UserData.bet261_user_data.login}
                            </Text>
                        </View>

                        <View style={styles.infoItem}>
                            <Text variant="caption" color="textSecondary">
                                ID Utilisateur
                            </Text>
                            <Text variant="body" weight="bold" color="text">
                                {bet261UserData.bet261_user_data.id}
                            </Text>
                        </View>

                        <View style={styles.infoItem}>
                            <Text variant="caption" color="textSecondary">
                                Référence
                            </Text>
                            <Text variant="body" weight="bold" color="text">
                                {bet261UserData.bet261_user_data.reference}
                            </Text>
                        </View>
                    </View>
                </View>
            )}

            {/* Separator */}
            <View style={[styles.separator, { backgroundColor: colors.border }]} />

            {/* Balance Section */}
            {bet261UserData && (
                <View style={styles.section}>
                    <Text variant="heading3" color="text" style={{ marginBottom: spacing.lg }}>
                        Soldes
                    </Text>

                    <View style={styles.balanceGrid}>
                        <View style={styles.balanceItem}>
                            <Text variant="caption" color="textSecondary">
                                Solde principal
                            </Text>
                            <Text variant="heading2" color="primary">
                                {formatBalance(bet261UserData.bet261_user_data.balance)}
                            </Text>
                        </View>

                        <View style={styles.balanceItem}>
                            <Text variant="caption" color="textSecondary">
                                Solde gratuit
                            </Text>
                            <Text variant="body" weight="bold" color="text">
                                {formatBalance(bet261UserData.bet261_user_data.freeBalance)}
                            </Text>
                        </View>

                        <View style={styles.balanceItem}>
                            <Text variant="caption" color="textSecondary">
                                Points de fidélité
                            </Text>
                            <Text variant="body" weight="bold" color="text">
                                {formatBalance(bet261UserData.bet261_user_data.loyaltyBalance)}
                            </Text>
                        </View>
                    </View>
                </View>
            )}

            {/* Separator */}
            <View style={[styles.separator, { backgroundColor: colors.border }]} />

            {/* Account Status Section */}
            {bet261UserData && (
                <View style={styles.section}>
                    <Text variant="heading3" color="text" style={{ marginBottom: spacing.lg }}>
                        État du compte
                    </Text>

                    <View style={styles.statusGrid}>
                        <View style={styles.statusItem}>
                            <Ionicons
                                name={bet261UserData.bet261_user_data.depositsAllowed ? "checkmark-circle" : "close-circle"}
                                size={20}
                                color={bet261UserData.bet261_user_data.depositsAllowed ? colors.success : colors.error}
                            />
                            <Text variant="body" color="text">
                                Dépôts autorisés
                            </Text>
                        </View>

                        <View style={styles.statusItem}>
                            <Ionicons
                                name={bet261UserData.bet261_user_data.withdrawalsAllowed ? "checkmark-circle" : "close-circle"}
                                size={20}
                                color={bet261UserData.bet261_user_data.withdrawalsAllowed ? colors.success : colors.error}
                            />
                            <Text variant="body" color="text">
                                Retraits autorisés
                            </Text>
                        </View>

                        <View style={styles.statusItem}>
                            <Ionicons
                                name={bet261UserData.bet261_user_data.isLocked ? "lock-closed" : "lock-open"}
                                size={20}
                                color={bet261UserData.bet261_user_data.isLocked ? colors.error : colors.success}
                            />
                            <Text variant="body" color="text">
                                {bet261UserData.bet261_user_data.isLocked ? "Compte verrouillé" : "Compte déverrouillé"}
                            </Text>
                        </View>

                        <View style={styles.statusItem}>
                            <Ionicons
                                name={bet261UserData.bet261_user_data.hasAcceptedGcu ? "document-text" : "document-text-outline"}
                                size={20}
                                color={bet261UserData.bet261_user_data.hasAcceptedGcu ? colors.success : colors.warning}
                            />
                            <Text variant="body" color="text">
                                {bet261UserData.bet261_user_data.hasAcceptedGcu ? "CGU acceptées" : "CGU non acceptées"}
                            </Text>
                        </View>
                    </View>
                </View>
            )}

            {/* Separator */}
            <View style={[styles.separator, { backgroundColor: colors.border }]} />

            {/* Local User Info Section */}
            {localUserInfo && (
                <View style={styles.section}>
                    <Text variant="heading3" color="text" style={{ marginBottom: spacing.lg }}>
                        Informations locales
                    </Text>

                    <View style={styles.infoGrid}>
                        <View style={styles.infoItem}>
                            <Text variant="caption" color="textSecondary">
                                Statut payant
                            </Text>
                            <Text variant="body" weight="bold" color={localUserInfo.status_payant ? "success" : "warning"}>
                                {localUserInfo.status_payant ? "Oui" : "Non"}
                            </Text>
                        </View>

                        <View style={styles.infoItem}>
                            <Text variant="caption" color="textSecondary">
                                Durée gratuite
                            </Text>
                            <Text variant="body" weight="bold" color="text">
                                {localUserInfo.dure_gratuit} jours
                            </Text>
                        </View>

                        <View style={styles.infoItem}>
                            <Text variant="caption" color="textSecondary">
                                Créé le
                            </Text>
                            <Text variant="body" weight="bold" color="text">
                                {formatDate(localUserInfo.created_at)}
                            </Text>
                        </View>

                        <View style={styles.infoItem}>
                            <Text variant="caption" color="textSecondary">
                                Dernière mise à jour
                            </Text>
                            <Text variant="body" weight="bold" color="text">
                                {formatDate(localUserInfo.updated_at)}
                            </Text>
                        </View>
                    </View>
                </View>
            )}

            {/* Separator */}
            <View style={[styles.separator, { backgroundColor: colors.border }]} />

            {/* Actions Section */}
            <View style={styles.section}>
                <Text variant="heading3" color="text" style={{ marginBottom: spacing.lg }}>
                    Actions
                </Text>

                <View style={styles.actionButtons}>
                    <Button
                        title="Actualiser"
                        onPress={onRefresh}
                        variant="outline"
                        size="sm"
                        disabled={loading}
                        loading={loading}
                        style={{ flex: 1 }}
                    />
                    <Button
                        title="Changer d'utilisateur"
                        onPress={handleSwitchUser}
                        variant="outline"
                        size="sm"
                        disabled={loading}
                        style={{ flex: 1 }}
                    />
                </View>

                <Button
                    title="Se déconnecter"
                    onPress={handleLogout}
                    variant="outline"
                    size="sm"
                    disabled={loading}
                    style={{
                        marginTop: spacing.sm,
                        borderColor: colors.error,
                    }}
                    textStyle={{ color: colors.error }}
                />
            </View>

            {/* Current User Info */}
            {currentUserLogin && (
                <View style={styles.currentUserInfo}>
                    <Text variant="caption" color="textSecondary">
                        Connecté en tant que: {currentUserLogin}
                    </Text>
                </View>
            )}
        </>
    );

    // Show login prompt if not authenticated AND no user data
    if (!isAuthenticated && !localUserInfo && !bet261UserData) {
        return (
            <SafeAreaProvider>
                <View style={[styles.container, { backgroundColor: colors.background }]}>
                    <StatusBar
                        barStyle={mode === 'dark' ? 'light-content' : 'dark-content'}
                        backgroundColor={colors.background}
                        translucent={false}
                    />

                    <SafeAreaView style={styles.safeArea} edges={['top']}>
                        <View style={styles.header}>
                            <Text variant="heading2" color="text">
                                Mon Profil
                            </Text>
                            <ThemeToggle />
                        </View>

                        <View style={styles.notAuthenticatedContainer}>
                            <Ionicons name="person-circle-outline" size={80} color={colors.textSecondary} />
                            <Text variant="heading3" color="text" style={{ marginTop: spacing.lg, marginBottom: spacing.md }}>
                                Non connecté
                            </Text>
                            <Text variant="body" color="textSecondary" style={{ textAlign: 'center', marginBottom: spacing.xl }}>
                                Vous devez vous connecter pour voir vos informations de profil.
                            </Text>
                            <Button
                                title="Se connecter"
                                onPress={() => router.replace('/(auth)/login')}
                                variant="primary"
                                size="md"
                            />
                        </View>
                    </SafeAreaView>
                </View>
            </SafeAreaProvider>
        );
    }

    return (
        <SafeAreaProvider>
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <StatusBar
                    barStyle={mode === 'dark' ? 'light-content' : 'dark-content'}
                    backgroundColor={colors.background}
                    translucent={false}
                />

                <SafeAreaView
                    style={[styles.safeArea, { paddingTop: insets.top }]}
                    edges={['top']}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <Text variant="heading2" color="text">
                            Mon Profil
                        </Text>
                        <ThemeToggle />
                    </View>

                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={[
                            styles.scrollContent,
                            { paddingBottom: insets.bottom + 90 }
                        ]}
                        refreshControl={
                            <RefreshControl
                                refreshing={loading && (!!localUserInfo || !!bet261UserData)}
                                onRefresh={onRefresh}
                                tintColor={colors.primary}
                                colors={[colors.primary]}
                            />
                        }
                        showsVerticalScrollIndicator={false}
                    >
                        {(initialLoading || (loading && !localUserInfo && !bet261UserData)) ?
                            renderSkeletonContent() :
                            renderContent()
                        }
                    </ScrollView>
                </SafeAreaView>

                {/* Modals */}
                <ConfirmationModal
                    visible={showRefreshErrorModal}
                    onClose={() => setShowRefreshErrorModal(false)}
                    title={modalData.title}
                    message={modalData.message}
                    confirmText="Compris"
                    onConfirm={() => setShowRefreshErrorModal(false)}
                    type="error"
                />

                <ConfirmationModal
                    visible={showLogoutModal}
                    onClose={() => setShowLogoutModal(false)}
                    title="Déconnexion"
                    message="Êtes-vous sûr de vouloir vous déconnecter ?"
                    confirmText="Déconnecter"
                    cancelText="Annuler"
                    onConfirm={handleConfirmLogout}
                    type="warning"
                    confirmButtonVariant="outline"
                />

                <ConfirmationModal
                    visible={showSwitchUserModal}
                    onClose={() => setShowSwitchUserModal(false)}
                    title="Changer d'utilisateur"
                    message="Voulez-vous vous connecter avec un autre compte ?"
                    confirmText="Changer"
                    cancelText="Annuler"
                    onConfirm={handleConfirmSwitchUser}
                    type="info"
                />

                <SuccessModal
                    visible={showSuccessModal}
                    onClose={() => setShowSuccessModal(false)}
                    title={modalData.title}
                    customMessage={modalData.message}
                    type={modalData.type}
                />
            </View>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        paddingTop: spacing.xs,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.lg,
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
    statusText: {
        color: '#ffffff',
        fontSize: 12,
        fontFamily: 'Poppins_700Bold',
    },
    infoGrid: {
        gap: spacing.md,
    },
    infoItem: {
        gap: spacing.xs,
    },
    balanceGrid: {
        gap: spacing.lg,
    },
    balanceItem: {
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: 12,
        backgroundColor: 'rgba(0,0,0,0.02)',
    },
    statusGrid: {
        gap: spacing.md,
    },
    statusItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    currentUserInfo: {
        marginTop: spacing.lg,
        paddingTop: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.1)',
        alignItems: 'center',
    },
    notAuthenticatedContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
    },
});