// src/features/admin/components/AdminProtectedRoute.tsx - CORRECTION
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { router, Href } from 'expo-router'; // 🔧 AJOUT: Import Href
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/shared/context/ThemeContext';
import { useAuth } from '@/src/shared/context/AuthContext';
import { useAdminPermissions } from '@/src/shared/hooks/admin/useAdminQueries';
import { RouteProtectionProps } from '@/src/features/auth/types';
import Text from '@/src/components/atoms/Text';
import Button from '@/src/components/atoms/Button';
import { spacing } from '@/src/styles';

export default function AdminProtectedRoute({
                                                children,
                                                requireAdmin = true,
                                                requireSuperAdmin = false,
                                                fallback,
                                                redirectTo = '/(main)/(tabs)' as Href,
                                            }: RouteProtectionProps) {
    const { colors } = useTheme();
    const { isAuthenticated, userRole } = useAuth();
    const permissions = useAdminPermissions();

    // Vérification des permissions
    const hasRequiredPermissions = () => {
        if (!isAuthenticated) return false;

        if (requireSuperAdmin) {
            return permissions.isSuperAdmin;
        }

        if (requireAdmin) {
            return permissions.isAdmin;
        }

        return true;
    };

    // 🔧 CORRECTION: Plus besoin de cast car redirectTo est maintenant de type Href
    useEffect(() => {
        if (!permissions.isLoading && !hasRequiredPermissions()) {
            console.log('🚫 AdminProtectedRoute: Permissions insuffisantes, redirection...');
            router.replace(redirectTo);
        }
    }, [permissions.isLoading, isAuthenticated, permissions.isAdmin, permissions.isSuperAdmin, redirectTo]);

    // Chargement des permissions
    if (permissions.isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.loadingContainer}>
                    <Text variant="body" color="textSecondary">
                        Vérification des permissions...
                    </Text>
                </View>
            </View>
        );
    }

    // Pas authentifié
    if (!isAuthenticated) {
        if (fallback) return <>{fallback}</>;

        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.messageContainer}>
                    <Ionicons name="lock-closed" size={64} color={colors.textSecondary} />
                    <Text variant="heading2" color="text" style={{ marginTop: spacing.lg }}>
                        Authentification requise
                    </Text>
                    <Text variant="body" color="textSecondary" style={{ textAlign: 'center', marginTop: spacing.md }}>
                        Vous devez vous connecter pour accéder à cette section.
                    </Text>
                    <Button
                        title="Se connecter"
                        onPress={() => router.replace('/(auth)/login')} // 🔧 CORRECTION: Plus de cast nécessaire
                        variant="primary"
                        size="md"
                        style={{ marginTop: spacing.xl }}
                    />
                </View>
            </View>
        );
    }

    // Permissions insuffisantes
    if (!hasRequiredPermissions()) {
        if (fallback) return <>{fallback}</>;

        const requiredRole = requireSuperAdmin ? 'Super Administrateur' : 'Administrateur';

        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.messageContainer}>
                    <Ionicons name="shield-half" size={64} color={colors.error} />
                    <Text variant="heading2" color="text" style={{ marginTop: spacing.lg }}>
                        Accès refusé
                    </Text>
                    <Text variant="body" color="textSecondary" style={{ textAlign: 'center', marginTop: spacing.md }}>
                        Cette section nécessite des droits {requiredRole}.
                    </Text>
                    <Text variant="caption" color="textSecondary" style={{ textAlign: 'center', marginTop: spacing.sm }}>
                        Votre rôle actuel: {getRoleLabel(userRole)}
                    </Text>
                    <Button
                        title="Retour"
                        onPress={() => router.back()}
                        variant="outline"
                        size="md"
                        style={{ marginTop: spacing.xl }}
                    />
                </View>
            </View>
        );
    }

    // Permissions OK - afficher le contenu
    return <>{children}</>;
}

// 🔧 CORRECTION: Hook utilitaire avec types corrects
export function useAdminRouteGuard(requireSuperAdmin: boolean = false) {
    const { isAuthenticated, userRole } = useAuth();
    const permissions = useAdminPermissions();

    const isAllowed = () => {
        if (!isAuthenticated) return false;

        if (requireSuperAdmin) {
            return permissions.isSuperAdmin;
        }

        return permissions.isAdmin;
    };

    return {
        isAllowed: isAllowed(),
        isLoading: permissions.isLoading,
        userRole,
        redirectPath: (isAuthenticated ? '/(main)/(tabs)' : '/(auth)/login') as Href, // 🔧 CORRECTION: Cast ici
    };
}

// Fonction utilitaire
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    messageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
});

// 🔧 SOLUTION ALTERNATIVE: Utilitaire de navigation typé
export const navigateToRoute = (route: string) => {
    try {
        router.replace(route as Href);
    } catch (error) {
        console.error('Navigation error:', error);
        // Fallback vers une route connue
        router.replace('/(main)/(tabs)');
    }
};