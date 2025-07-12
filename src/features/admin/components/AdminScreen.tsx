// src/features/admin/components/AdminScreen.tsx
import React, { useState, useCallback, useEffect } from 'react';
import {
    View,
    StyleSheet,
    StatusBar,
    SafeAreaView,
    TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/src/shared/context/ThemeContext';
import { useAuth } from '@/src/shared/context/AuthContext';
import { useAdminPermissions, useMyRole } from '@/src/shared/hooks/admin/useAdminQueries';
import Header from '@/src/components/molecules/Header';
import Text from '@/src/components/atoms/Text';
import Button from '@/src/components/atoms/Button';
import ThemeToggle from '@/src/components/atoms/ThemeToggle';
import ConfirmationModal from '@/src/components/molecules/ConfirmationModal';
import UsersList from './UsersList';
import SystemStatus from './SystemStatus';
import { spacing } from '@/src/styles';

type AdminTab = 'users' | 'status';

interface ModalState {
    visible: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'info' | 'warning' | 'success' | 'error';
}

export default function AdminScreen() {
    const { colors, mode } = useTheme();
    const insets = useSafeAreaInsets();
    const { isAuthenticated, userRole, isAdmin, currentUserLogin } = useAuth();
    const permissions = useAdminPermissions();
    const { data: myRole, isLoading: roleLoading } = useMyRole();

    // État local
    const [activeTab, setActiveTab] = useState<AdminTab>('users');
    const [modal, setModal] = useState<ModalState>({
        visible: false,
        title: '',
        message: '',
        onConfirm: () => {},
    });

    // Fonction helper pour afficher les modales
    const showModal = useCallback((modalConfig: Omit<ModalState, 'visible'>) => {
        setModal({
            visible: true,
            ...modalConfig,
        });
    }, []);

    const hideModal = useCallback(() => {
        setModal(prev => ({ ...prev, visible: false }));
    }, []);

    // Vérification des permissions au chargement
    useEffect(() => {
        if (!roleLoading && !permissions.canViewAdminPanel) {
            showModal({
                title: 'Accès refusé',
                message: 'Vous n\'avez pas les permissions pour accéder au panel administrateur.',
                type: 'error',
                onConfirm: () => {
                    hideModal();
                    router.back();
                }
            });
        }
    }, [permissions.canViewAdminPanel, roleLoading, showModal, hideModal]);

    // Protection de la route - affichage conditionnel
    if (!isAuthenticated) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <StatusBar
                    barStyle={mode === 'dark' ? 'light-content' : 'dark-content'}
                    backgroundColor={colors.background}
                />

                <View style={styles.unauthorizedContainer}>
                    <Ionicons name="lock-closed" size={64} color={colors.textSecondary} />
                    <Text variant="heading2" color="text" style={{ marginTop: spacing.lg }}>
                        Authentification requise
                    </Text>
                    <Text variant="body" color="textSecondary" style={{ textAlign: 'center', marginTop: spacing.md }}>
                        Vous devez vous connecter pour accéder au panel administrateur.
                    </Text>
                    <Button
                        title="Se connecter"
                        onPress={() => router.replace('/(auth)/login')}
                        variant="primary"
                        size="md"
                        style={{ marginTop: spacing.xl }}
                    />
                </View>
            </SafeAreaView>
        );
    }

    if (roleLoading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <StatusBar
                    barStyle={mode === 'dark' ? 'light-content' : 'dark-content'}
                    backgroundColor={colors.background}
                />

                <View style={styles.loadingContainer}>
                    <Text variant="body" color="textSecondary">
                        Vérification des permissions...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!permissions.canViewAdminPanel) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <StatusBar
                    barStyle={mode === 'dark' ? 'light-content' : 'dark-content'}
                    backgroundColor={colors.background}
                />

                <View style={styles.unauthorizedContainer}>
                    <Text variant="heading2" color="text" style={{ marginTop: spacing.lg }}>
                        Accès refusé
                    </Text>
                    <Text variant="body" color="textSecondary" style={{ textAlign: 'center', marginTop: spacing.md }}>
                        Vous n'avez pas les permissions administrateur nécessaires pour accéder à cette section.
                    </Text>
                    <Text variant="caption" color="textSecondary" style={{ textAlign: 'center', marginTop: spacing.sm }}>
                        Rôle actuel: {userRole}
                    </Text>
                    <Button
                        title="Retour"
                        onPress={() => router.back()}
                        variant="outline"
                        size="md"
                        style={{ marginTop: spacing.xl }}
                    />
                </View>

                {/* Modal de confirmation globale */}
                <ConfirmationModal
                    visible={modal.visible}
                    onClose={hideModal}
                    title={modal.title}
                    message={modal.message}
                    confirmText="OK"
                    cancelText="Fermer"
                    onConfirm={modal.onConfirm}
                    type={modal.type}
                />
            </SafeAreaView>
        );
    }

    // Rendu des onglets
    const renderTabButton = (tab: AdminTab, icon: string, label: string) => (
        <TouchableOpacity
            style={[
                styles.tabButton,
                {
                    backgroundColor: activeTab === tab ? colors.primary : 'transparent',
                    borderColor: colors.border,
                }
            ]}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.7}
        >
            <Ionicons
                name={icon as any}
                size={20}
                color={activeTab === tab ? colors.surface : colors.textSecondary}
            />
            <Text
                variant="body"
                color={activeTab === tab ? "surface" : "textSecondary"}
                weight={activeTab === tab ? "bold" : "regular"}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case 'users':
                return <UsersList showModal={showModal} hideModal={hideModal} />;
            case 'status':
                return <SystemStatus />;
            default:
                return null;
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar
                barStyle={mode === 'dark' ? 'light-content' : 'dark-content'}
                backgroundColor={colors.background}
            />

            {/* Header avec informations admin */}
            <Header
                title="Administration"
                showBackButton={true}
                rightComponent={<ThemeToggle />}
                elevated={true}
            />

            {/* Informations de l'administrateur connecté */}
            <View style={[styles.adminInfoContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                <View style={styles.adminInfo}>
                    <View style={styles.adminDetails}>
                        <Text variant="body" color="text" weight="bold">
                            {currentUserLogin}
                        </Text>
                        <View style={[styles.roleBadge, { backgroundColor: getRoleColor(userRole, colors) }]}>
                            <Text style={styles.roleText}>
                                {getRoleLabel(userRole)}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.permissionsInfo}>
                        <View style={styles.permissionItem}>
                            <Ionicons
                                name={permissions.canPromote ? "checkmark-circle" : "close-circle"}
                                size={14}
                                color={permissions.canPromote ? colors.success : colors.textSecondary}
                            />
                            <Text variant="caption" color="textSecondary">
                                Promotion
                            </Text>
                        </View>

                        <View style={styles.permissionItem}>
                            <Ionicons
                                name={permissions.canDemote ? "checkmark-circle" : "close-circle"}
                                size={14}
                                color={permissions.canDemote ? colors.success : colors.textSecondary}
                            />
                            <Text variant="caption" color="textSecondary">
                                Rétrogradation
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Navigation par onglets */}
            <View style={[styles.tabsContainer, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
                {renderTabButton('users', 'people-outline', 'Utilisateurs')}
                {renderTabButton('status', 'analytics-outline', 'Système')}
            </View>

            {/* Contenu de l'onglet actif */}
            <View style={styles.contentContainer}>
                {renderTabContent()}
            </View>

            {/* Modal de confirmation globale */}
            <ConfirmationModal
                visible={modal.visible}
                onClose={hideModal}
                title={modal.title}
                message={modal.message}
                confirmText="OK"
                cancelText="Annuler"
                onConfirm={modal.onConfirm}
                type={modal.type}
            />
        </SafeAreaView>
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
        case 'super_admin': return 'Super Administrateur';
        case 'admin': return 'Administrateur';
        default: return 'Utilisateur';
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    unauthorizedContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    adminInfoContainer: {
        borderBottomWidth: 1,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    adminInfo: {
        gap: spacing.sm,
    },
    adminDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
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
    permissionsInfo: {
        flexDirection: 'row',
        gap: spacing.lg,
    },
    permissionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        gap: spacing.sm,
    },
    tabButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: 8,
        borderWidth: 1,
    },
    contentContainer: {
        flex: 1,
    },
});