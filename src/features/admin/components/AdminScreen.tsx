// src/features/admin/components/AdminScreen.tsx - Version simplifiée avec hook responsive
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
import { useResponsive, getLayoutConfig } from '@/src/shared/utils/responsive.utils';
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

    // Hook responsive personnalisé
    const screen = useResponsive();
    const layout = getLayoutConfig(screen.device);

    // Fonction utilitaire pour créer des styles conditionnels sûrs
    const createConditionalStyle = () => {
        const baseStyle = styles.desktopMainContent;
        if (layout.contentMaxWidth === '100%') {
            return baseStyle;
        }
        return [baseStyle, { maxWidth: layout.contentMaxWidth as number }];
    };

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
            {/* Header */}
            <View style={[styles.sidebarHeader, { borderBottomColor: colors.border }]}>
                <Text variant="heading2" color="text" weight="bold">
                    Administration
                </Text>
                <ThemeToggle />
            </View>

            {/* Informations admin */}
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
                        <Text variant="caption" color="textSecondary">Promotion</Text>
                    </View>
                    <View style={styles.permissionItem}>
                        <Ionicons
                            name={permissions.canDemote ? "checkmark-circle" : "close-circle"}
                            size={14}
                            color={permissions.canDemote ? colors.success : colors.textSecondary}
                        />
                        <Text variant="caption" color="textSecondary">Rétrogradation</Text>
                    </View>
                </View>
            </View>

            {/* Navigation */}
            <View style={styles.navigation}>
                {[
                    { key: 'users', icon: 'people-outline', label: 'Utilisateurs' },
                    { key: 'status', icon: 'analytics-outline', label: 'Système' }
                ].map(({ key, icon, label }) => (
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

            {/* Actions */}
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

    // Composant onglets pour mobile/tablette
    const MobileTabs = () => (
        <View style={[styles.tabsContainer, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
            {[
                { key: 'users', icon: 'people-outline', label: 'Utilisateurs' },
                { key: 'status', icon: 'analytics-outline', label: 'Système' }
            ].map(({ key, icon, label }) => (
                <TouchableOpacity
                    key={key}
                    style={[
                        styles.tabButton,
                        {
                            backgroundColor: activeTab === key ? colors.primary : 'transparent',
                            borderColor: colors.border,
                        }
                    ]}
                    onPress={() => setActiveTab(key as AdminTab)}
                    activeOpacity={0.7}
                >
                    <Ionicons
                        name={icon as any}
                        size={20}
                        color={activeTab === key ? colors.surface : colors.textSecondary}
                    />
                    <Text
                        variant="body"
                        color={activeTab === key ? "primary" : "textSecondary"}
                        weight={activeTab === key ? "bold" : "regular"}
                        style={activeTab === key ? { color: colors.surface } : undefined}
                    >
                        {label}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    // Composant contenu principal
    const MainContent = () => {
        switch (activeTab) {
            case 'users':
                return <UsersList showModal={showModal} hideModal={hideModal} />;
            case 'status':
                return <SystemStatus />;
            default:
                return null;
        }
    };

    // Protection de la route - affichage conditionnel
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
                        {/* Header desktop */}
                        <View style={[
                            styles.desktopHeader,
                            {
                                backgroundColor: colors.surface,
                                borderBottomColor: colors.border,
                                height: layout.headerHeight
                            }
                        ]}>
                            <Text variant="heading3" color="text" weight="bold">
                                {activeTab === 'users' ? 'Gestion des Utilisateurs' : 'Statut du Système'}
                            </Text>
                        </View>

                        {/* Contenu principal */}
                        <View style={createConditionalStyle()}>
                            <MainContent />
                        </View>
                    </View>
                </View>
            ) : (
                // Layout Mobile/Tablette
                <>
                    {/* Header mobile avec informations admin */}
                    <Header
                        title="Administration"
                        showBackButton={true}
                        rightComponent={<ThemeToggle />}
                        elevated={true}
                    />

                    {/* Informations admin mobile */}
                    <View style={[
                        styles.mobileAdminInfo,
                        {
                            backgroundColor: colors.surface,
                            borderBottomColor: colors.border
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

                        <View style={styles.permissionsInfo}>
                            <View style={styles.permissionItem}>
                                <Ionicons
                                    name={permissions.canPromote ? "checkmark-circle" : "close-circle"}
                                    size={14}
                                    color={permissions.canPromote ? colors.success : colors.textSecondary}
                                />
                                <Text variant="caption" color="textSecondary">Promotion</Text>
                            </View>
                            <View style={styles.permissionItem}>
                                <Ionicons
                                    name={permissions.canDemote ? "checkmark-circle" : "close-circle"}
                                    size={14}
                                    color={permissions.canDemote ? colors.success : colors.textSecondary}
                                />
                                <Text variant="caption" color="textSecondary">Rétrogradation</Text>
                            </View>
                        </View>
                    </View>

                    {/* Onglets mobiles */}
                    <MobileTabs />

                    {/* Contenu principal */}
                    <View style={styles.mobileContent}>
                        <MainContent />
                    </View>
                </>
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

    // Informations Admin
    adminInfo: {
        padding: spacing.lg,
        margin: spacing.lg,
        borderRadius: 12,
        gap: spacing.md,
    },
    mobileAdminInfo: {
        borderBottomWidth: 1,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
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

    // Navigation
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

    // Onglets Mobile
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

    // Contenu Mobile
    mobileContent: {
        flex: 1,
    },
});