// src/shared/context/AuthContext.tsx - UPDATED avec rôles admin
import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { authService } from '@/src/shared/services/api/auth/auth.api';
import { tokenRefreshManager } from '@/src/shared/services/api/auth/TokenRefreshManager';
import { LoginRequest, LocalUserInfo, Bet261UserData, AuthContextType } from '@/src/features/auth/types';
import {
    useLogin,
    useLogout,
    useUserInfo,
    useBet261UserData,
    useRefreshUserInfo,
    useSwitchUser,
    useAuthUtils
} from '@/src/shared/hooks/auth/useAuthQueries';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    // ✅ États locaux simplifiés
    const [currentUserLogin, setCurrentUserLogin] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    // Réactif (contrairement à la lecture directe de authService.getAuthToken()) : la restauration au démarrage,
    // la déconnexion et l'expiration de session mettent l'interface à jour
    const [hasSession, setHasSession] = useState<boolean>(!!authService.getAuthToken());
    const [isRestoring, setIsRestoring] = useState<boolean>(true);
    const queryClient = useQueryClient();

    // ✅ React Query hooks
    const loginMutation = useLogin();
    const logoutMutation = useLogout();
    const refreshMutation = useRefreshUserInfo();
    const switchUserMutation = useSwitchUser();
    const userInfoQuery = useUserInfo();
    const bet261DataQuery = useBet261UserData();
    const authUtils = useAuthUtils();

    // ✅ États dérivés de React Query
    const loading = loginMutation.isPending ||
        logoutMutation.isPending ||
        refreshMutation.isPending ||
        switchUserMutation.isPending ||
        userInfoQuery.isLoading ||
        bet261DataQuery.isLoading;

    const localUserInfo = userInfoQuery.data || null;
    const bet261UserData = bet261DataQuery.data || null;
    const isAuthenticated = hasSession && !!(localUserInfo && bet261UserData);

    // Session en cours de chargement : restauration au démarrage, ou token présent mais données utilisateur pas
    // encore arrivées (renouvellement du token + 2 requêtes). Les écrans affichent alors un chargement
    // au lieu de « Connexion requise ».
    const isAuthPending = isRestoring || (
        hasSession && !isAuthenticated && (
            userInfoQuery.isPending || bet261DataQuery.isPending ||
            userInfoQuery.isFetching || bet261DataQuery.isFetching
        )
    );

    // ✅ Au démarrage : retrouver la session mémorisée (rechargement de page, redémarrage de l'app, Fast Refresh)
    useEffect(() => {
        let cancelled = false;

        authService.restoreSession()
            .then((session) => {
                if (cancelled) return;
                if (session) {
                    setCurrentUserLogin(session.userLogin);
                    setHasSession(true);
                }
            })
            .catch((err) => console.error('AuthContext: restauration de session impossible:', err))
            .finally(() => {
                if (!cancelled) setIsRestoring(false);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    // ✅ Session morte (le serveur ne reconnaît plus le token) : nettoyer et revenir au login
    useEffect(() => {
        return tokenRefreshManager.onSessionExpired(() => {
            console.warn('AuthContext: session expirée, retour au login');
            authService.clearAuthToken();
            queryClient.clear();
            setCurrentUserLogin(null);
            setHasSession(false);
            router.replace('/(auth)/login');
        });
    }, [queryClient]);

    // 🆕 Propriétés de rôle dérivées des données utilisateur
    const userRole = useMemo(() => {
        if (!localUserInfo?.role_info) return 'user' as const;
        return localUserInfo.role_info.role;
    }, [localUserInfo]);

    const isAdmin = useMemo(() => {
        if (!localUserInfo?.role_info) return false;
        return localUserInfo.role_info.is_admin;
    }, [localUserInfo]);

    const isSuperAdmin = useMemo(() => {
        if (!localUserInfo?.role_info) return false;
        return localUserInfo.role_info.is_super_admin;
    }, [localUserInfo]);

    // 🆕 Méthodes utilitaires pour les rôles
    const hasAdminAccess = useCallback(() => {
        return isAdmin || isSuperAdmin;
    }, [isAdmin, isSuperAdmin]);

    const canAccessAdminPanel = useCallback(() => {
        return isAuthenticated && hasAdminAccess();
    }, [isAuthenticated, hasAdminAccess]);

    const getUserRole = useCallback(() => {
        return userRole;
    }, [userRole]);

    // ✅ Wrapper pour login avec gestion des rôles
    const login = useCallback(async (credentials: LoginRequest) => {
        try {
            setError(null);
            setCurrentUserLogin(credentials.bet_login);


            const loginResponse = await loginMutation.mutateAsync(credentials);
            setHasSession(true);
            setCurrentUserLogin(loginResponse.user_login ?? credentials.bet_login);

            // Attendre que les données utilisateur soient chargées
            await Promise.all([
                userInfoQuery.refetch(),
                bet261DataQuery.refetch(),
            ]);

            // 🆕 Log des informations de rôle après connexion
            const userData = userInfoQuery.data;
            if (userData?.role_info) {
            }


            return {
                success: true,
                localUser: userInfoQuery.data,
                bet261User: bet261DataQuery.data,
                loginResponse
            };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur de connexion';
            setError(errorMessage);
            setCurrentUserLogin(null);
            console.error('AuthContext: Login error:', err);

            return { success: false, error: errorMessage };
        }
    }, [loginMutation, userInfoQuery, bet261DataQuery]);

    // ✅ Wrapper pour logout
    const logout = useCallback(async () => {
        try {

            await logoutMutation.mutateAsync();
            setHasSession(false);
            setCurrentUserLogin(null);
            setError(null);

        } catch (err) {
            console.error('AuthContext: Logout error:', err);
            // Nettoyer même en cas d'erreur
            setHasSession(false);
            setCurrentUserLogin(null);
            setError(null);
        }
    }, [logoutMutation]);

    // ✅ Wrapper pour refresh
    const refreshUserInfo = useCallback(async () => {
        try {
            setError(null);

            if (!isAuthenticated) {
                throw new Error('Utilisateur non connecté');
            }


            const result = await refreshMutation.mutateAsync();

            // 🆕 Log des informations de rôle après refresh
            if (result.localUser.role_info) {
            }


            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur de récupération des données';
            setError(errorMessage);
            console.error('AuthContext: Refresh user info error:', err);
            throw err;
        }
    }, [refreshMutation, isAuthenticated, currentUserLogin]);

    // ✅ Wrapper pour switch user
    const switchUser = useCallback(async (credentials: LoginRequest) => {
        try {

            const result = await switchUserMutation.mutateAsync(credentials);
            setHasSession(true);
            setCurrentUserLogin(credentials.bet_login);
            setError(null);


            return {
                success: true,
                localUser: userInfoQuery.data,
                bet261User: bet261DataQuery.data,
                loginResponse: result
            };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur de changement d\'utilisateur';
            setError(errorMessage);
            console.error('AuthContext: Switch user error:', err);

            return { success: false, error: errorMessage };
        }
    }, [switchUserMutation, userInfoQuery, bet261DataQuery]);

    // ✅ Nettoyer les données quand l'utilisateur se déconnecte
    useEffect(() => {
        if (!authService.getAuthToken()) {
            setCurrentUserLogin(null);
            setError(null);
        }
    }, [isAuthenticated]);

    // ✅ Gestion des erreurs React Query
    useEffect(() => {
        const queryError = userInfoQuery.error || bet261DataQuery.error ||
            loginMutation.error || logoutMutation.error ||
            refreshMutation.error || switchUserMutation.error;

        if (queryError) {
            setError(queryError.message);
        }
    }, [
        userInfoQuery.error, bet261DataQuery.error,
        loginMutation.error, logoutMutation.error,
        refreshMutation.error, switchUserMutation.error
    ]);

    // ✅ Debug effect - avec infos de rôle
    useEffect(() => {
    }, [isAuthenticated, localUserInfo, bet261UserData, loading, currentUserLogin, userRole, isAdmin, isSuperAdmin, canAccessAdminPanel, error]);

    const value: AuthContextType = {
        // États de base
        loading,
        localUserInfo,
        bet261UserData,
        isAuthenticated,
        hasSession,
        isRestoring,
        isAuthPending,
        error,
        currentUserLogin,

        // 🆕 Propriétés de rôle
        userRole,
        isAdmin,
        isSuperAdmin,

        // Actions de base
        login,
        logout,
        refreshUserInfo,
        switchUser,

        // 🆕 Méthodes utilitaires pour les rôles
        hasAdminAccess,
        canAccessAdminPanel,
        getUserRole,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}