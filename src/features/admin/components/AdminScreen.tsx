// src/features/admin/components/AdminScreen.tsx - LAYOUT MOBILE CORRIGÉ avec padding fixé

import React, { useState, useCallback, useEffect } from 'react';
import {
    View,
    StyleSheet,
    StatusBar,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/src/shared/context/ThemeContext';
import { useAuth } from '@/src/shared/context/AuthContext';
import { useAdminPermissions, useMyRole } from '@/src/shared/hooks/admin/useAdminQueries';
import { useResponsive, getLayoutConfig } from '@/src/shared/utils/responsive.utils';
import Header from '@/src/components/molecules/Header';
import Text from '@/src/components/atoms/Text';
import Button from '@/src/components/atoms/Button';
import ThemeToggle from '@/src/components/atoms/ThemeToggle';
import ConfirmationModal from '@/src/components/molecules/ConfirmationModal';
import UsersList from './UsersList';
import SystemStatus from './SystemStatus';
import SubscriptionsList from './SubscriptionsList';
import { spacing } from '@/src/styles';

type AdminTab = 'users' | 'subscriptions' | 'status';

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

    const screen = useResponsive();
    const layout = getLayoutConfig(screen.device);

    const createConditionalStyle = () => {
        const baseStyle = styles.desktopMainContent;
        if (layout.contentMaxWidth === '100%') {
            return baseStyle;
        }
        return [baseStyle, { maxWidth: layout.contentMaxWidth as number }];
    };

    const [activeTab, setActiveTab] = useState<AdminTab>('users');
    const [modal, setModal] = useState<ModalState>({
        visible: false,
        title: '',
        message: '',
        onConfirm: () => {},
    });

    const showModal = useCallback((modalConfig: Omit<ModalState, 'visible'>) => {
        setModal({
            visible: true,
            ...modalConfig,
        });
    }, []);

    const hideModal = useCallback(() => {
        setModal(prev => ({ ...prev, visible: false }));
    }, []);

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

    const tabsConfig = [
        { key: 'users', icon: 'people-outline', label: 'Utilisateurs' },
        { key: 'subscriptions', icon: 'card-outline', label: 'Abonnements' },
        { key: 'status', icon: 'analytics-outline', label: 'Système' }
    ] as const;

    // Composant sidebar pour desktop
    const DesktopSidebar = () => (
        <View style={[
            styles.sidebar,
            {
                width: layout.sidebarWidth,
                backgroundColor: colors.surface,
                borderRightColor: colors.border
            }
        ]}>
            <View style={[styles.sidebarHeader, { borderBottomColor: colors.border }]}>
                <Text variant="heading2" color="text" weight="bold">
                    Administration
                </Text>
                <ThemeToggle />
            </View>

            <View style={[styles.adminInfo, { backgroundColor: colors.background }]}>
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
                        <Text variant="caption" color="textSecondary">Gestion rôles</Text>
                    </View>
                    <View style={styles.permissionItem}>
                        <Ionicons
                            name={permissions.canViewAdminPanel ? "checkmark-circle" : "close-circle"}
                            size={14}
                            color={permissions.canViewAdminPanel ? colors.success : colors.textSecondary}
                        />
                        <Text variant="caption" color="textSecondary">Panel admin</Text>
                    </View>
                </View>
            </View>

            <View style={styles.navigation}>
                {tabsConfig.map(({ key, icon, label }) => (
                    <TouchableOpacity
                        key={key}
                        style={[
                            styles.navItem,
                            {
                                backgroundColor: activeTab === key ? colors.primary + '15' : 'transparent',
                                borderLeftColor: activeTab === key ? colors.primary : 'transparent',
                            }
                        ]}
                        onPress={() => setActiveTab(key as AdminTab)}
                    >
                        <Ionicons
                            name={icon as any}
                            size={20}
                            color={activeTab === key ? colors.primary : colors.textSecondary}
                        />
                        <Text
                            variant="body"
                            color={activeTab === key ? "primary" : "textSecondary"}
                            weight={activeTab === key ? "bold" : "regular"}
                        >
                            {label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={[styles.sidebarActions, { borderTopColor: colors.border }]}>
                <Button
                    title="Retour"
                    onPress={() => router.back()}
                    variant="outline"
                    size="sm"
                />
            </View>
        </View>
    );

    // Composant onglets mobile COMPACT
    const MobileTabs = () => (
        <View style={[
            styles.tabsContainer,
            {
                backgroundColor: colors.surface,
                borderBottomColor: colors.border,
                paddingVertical: spacing.xs,
                paddingHorizontal: spacing.sm,
            }
        ]}>
            {tabsConfig.map(({ key, icon, label }) => (
                <TouchableOpacity
                    key={key}
                    style={[
                        styles.tabButton,
                        {
                            backgroundColor: activeTab === key ? colors.primary : colors.background,
                            borderColor: activeTab === key ? colors.primary : colors.border,
                            paddingVertical: spacing.sm,
                            paddingHorizontal: spacing.xs,
                        }
                    ]}
                    onPress={() => setActiveTab(key as AdminTab)}
                    activeOpacity={0.7}
                >
                    <Ionicons
                        name={icon as any}
                        size={18}
                        color={activeTab === key ? colors.surface : colors.textSecondary}
                    />
                    <Text
                        variant="caption"
                        color={activeTab === key ? "primary" : "textSecondary"}
                        weight={activeTab === key ? "bold" : "regular"}
                        style={[
                            activeTab === key ? { color: colors.surface } : undefined,
                            screen.width < 350 && styles.smallScreenText
                        ]}
                    >
                        {screen.width < 350 ? getShortLabel(key) : label}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    // Informations admin mobile COMPACTES
    const MobileAdminInfo = () => (
        <View style={[
            styles.mobileAdminInfo,
            {
                backgroundColor: colors.surface,
                borderBottomColor: colors.border,
                paddingVertical: spacing.sm,
                paddingHorizontal: spacing.md,
            }
        ]}>
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

            <View style={styles.permissionsInfoMobile}>
                <View style={styles.permissionItem}>
                    <Ionicons
                        name={permissions.canPromote ? "checkmark-circle" : "close-circle"}
                        size={12}
                        color={permissions.canPromote ? colors.success : colors.textSecondary}
                    />
                    <Text variant="caption" color="textSecondary" style={styles.permissionTextMobile}>
                        Gestion rôles
                    </Text>
                </View>
                <View style={styles.permissionItem}>
                    <Ionicons
                        name={permissions.canViewAdminPanel ? "checkmark-circle" : "close-circle"}
                        size={12}
                        color={permissions.canViewAdminPanel ? colors.success : colors.textSecondary}
                    />
                    <Text variant="caption" color="textSecondary" style={styles.permissionTextMobile}>
                        Panel admin
                    </Text>
                </View>
            </View>
        </View>
    );

    const MainContent = () => {
        switch (activeTab) {
            case 'users':
                return <UsersList showModal={showModal} hideModal={hideModal} />;
            case 'subscriptions':
                return <SubscriptionsList showModal={showModal} hideModal={hideModal} />;
            case 'status':
                return <SystemStatus />;
            default:
                return null;
        }
    };

    const getActiveTabTitle = () => {
        switch (activeTab) {
            case 'users':
                return 'Gestion des Utilisateurs';
            case 'subscriptions':
                return 'Gestion des Abonnements';
            case 'status':
                return 'Statut du Système';
            default:
                return 'Administration';
        }
    };

    // Fonction pour les labels courts sur petits écrans
    const getShortLabel = (key: string) => {
        switch (key) {
            case 'users':
                return 'Users';
            case 'subscriptions':
                return 'Subs';
            case 'status':
                return 'Status';
            default:
                return key;
        }
    };

    // Protection de la route - utilisateur non authentifié
    if (!isAuthenticated) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <StatusBar
                    barStyle={mode === 'dark' ? 'light-content' : 'dark-content'}
                    backgroundColor={colors.background}
                />

                <View style={[
                    styles.centeredContainer,
                    screen.isDesktop && styles.desktopCenteredContainer
                ]}>
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

                <View style={[
                    styles.centeredContainer,
                    screen.isDesktop && styles.desktopCenteredContainer
                ]}>
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

                <View style={[
                    styles.centeredContainer,
                    screen.isDesktop && styles.desktopCenteredContainer
                ]}>
                    <Ionicons name="shield-outline" size={64} color={colors.error} />
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

    // Rendu principal en fonction de la taille d'écran
    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar
                barStyle={mode === 'dark' ? 'light-content' : 'dark-content'}
                backgroundColor={colors.background}
            />

            {screen.isDesktop ? (
                // Layout Desktop avec sidebar
                <View style={styles.desktopLayout}>
                    <DesktopSidebar />

                    <View style={styles.desktopContent}>
                        <View style={[
                            styles.desktopHeader,
                            {
                                backgroundColor: colors.surface,
                                borderBottomColor: colors.border,
                                height: layout.headerHeight
                            }
                        ]}>
                            <Text variant="heading3" color="text" weight="bold">
                                {getActiveTabTitle()}
                            </Text>
                        </View>

                        <View style={createConditionalStyle()}>
                            <MainContent />
                        </View>
                    </View>
                </View>
            ) : (
                // 🔧 Layout Mobile/Tablette OPTIMISÉ avec padding fixé
                <View style={styles.mobileLayout}>
                    {/* Header mobile compact */}
                    <Header
                        title="Administration"
                        showBackButton={true}
                        rightComponent={<ThemeToggle />}
                        elevated={true}
                    />

                    {/* 🔧 Contenu scrollable avec padding bottom fixé */}
                    <ScrollView
                        style={styles.mobileScrollContainer}
                        contentContainerStyle={[
                            styles.mobileScrollContent,
                            {
                                // 🔧 Padding bottom dynamique pour éviter la coupure
                                paddingBottom: insets.bottom + 90 + spacing.xl
                            }
                        ]}
                        showsVerticalScrollIndicator={false}
                        bounces={false}
                    >
                        {/* Informations admin compactes */}
                        <MobileAdminInfo />

                        {/* Onglets compacts */}
                        <MobileTabs />

                        {/* Contenu principal dans un conteneur avec hauteur flexible */}
                        <View style={styles.mobileMainContent}>
                            <MainContent />
                        </View>
                    </ScrollView>
                </View>
            )}

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

    // Styles communs
    centeredContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    desktopCenteredContainer: {
        maxWidth: 600,
        alignSelf: 'center',
    },

    // Layout Desktop
    desktopLayout: {
        flex: 1,
        flexDirection: 'row',
    },

    // Sidebar Desktop
    sidebar: {
        borderRightWidth: 1,
        flexDirection: 'column',
    },
    sidebarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.xl,
        borderBottomWidth: 1,
    },

    // Contenu Desktop
    desktopContent: {
        flex: 1,
        flexDirection: 'column',
    },
    desktopHeader: {
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.lg,
        borderBottomWidth: 1,
        justifyContent: 'center',
    },
    desktopMainContent: {
        flex: 1,
        alignSelf: 'center',
        width: '100%',
    },

    // 🔧 Layout Mobile optimisé
    mobileLayout: {
        flex: 1,
    },
    mobileScrollContainer: {
        flex: 1,
    },
    mobileScrollContent: {
        flexGrow: 1,
        // Le paddingBottom est maintenant géré dynamiquement dans le JSX
    },
    mobileMainContent: {
        flex: 1,
        minHeight: 600, // Hauteur minimum pour assurer le scroll
    },

    // Informations Admin
    adminInfo: {
        padding: spacing.lg,
        margin: spacing.lg,
        borderRadius: 12,
        gap: spacing.md,
    },
    mobileAdminInfo: {
        borderBottomWidth: 1,
        gap: spacing.xs,
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
    // Version mobile compacte des permissions
    permissionsInfoMobile: {
        flexDirection: 'row',
        gap: spacing.md,
        flexWrap: 'wrap',
    },
    permissionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    // Texte plus petit pour mobile
    permissionTextMobile: {
        fontSize: 11,
    },

    // Navigation Desktop
    navigation: {
        flex: 1,
        paddingVertical: spacing.lg,
    },
    navItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        padding: spacing.lg,
        paddingLeft: spacing.xl,
        borderLeftWidth: 3,
    },
    sidebarActions: {
        padding: spacing.lg,
        borderTopWidth: 1,
    },

    // Onglets Mobile optimisés
    tabsContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        gap: spacing.xs,
    },
    tabButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
        borderRadius: 6,
        borderWidth: 1,
        minHeight: 44, // Hauteur minimum pour la navigation tactile
    },

    // Styles pour petits écrans
    smallScreenText: {
        fontSize: 10,
    },
});