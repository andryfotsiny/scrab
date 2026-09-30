// src/shared/context/AuthContext.tsx - UPDATED avec rôles admin
import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { authService } from '@/src/shared/services/api/auth/auth.api';
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
    const isAuthenticated = !!authService.getAuthToken() && !!(localUserInfo && bet261UserData);

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

            console.log('🔐 AuthContext: Starting login process for:', credentials.bet_login);

            const loginResponse = await loginMutation.mutateAsync(credentials);

            // Attendre que les données utilisateur soient chargées
            await Promise.all([
                userInfoQuery.refetch(),
                bet261DataQuery.refetch(),
            ]);

            // 🆕 Log des informations de rôle après connexion
            const userData = userInfoQuery.data;
            if (userData?.role_info) {
                console.log('👤 AuthContext: User role info:', {
                    user: credentials.bet_login,
                    role: userData.role_info.role,
                    isAdmin: userData.role_info.is_admin,
                    isSuperAdmin: userData.role_info.is_super_admin
                });
            }

            console.log('🎉 AuthContext: Authentication completed successfully');

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
            console.error('❌ AuthContext: Login error:', err);

            return { success: false, error: errorMessage };
        }
    }, [loginMutation, userInfoQuery, bet261DataQuery]);

    // ✅ Wrapper pour logout
    const logout = useCallback(async () => {
        try {
            console.log('🚪 AuthContext: Starting logout...');

            await logoutMutation.mutateAsync();
            setCurrentUserLogin(null);
            setError(null);

            console.log('✅ AuthContext: Logout completed');
        } catch (err) {
            console.error('❌ AuthContext: Logout error:', err);
            // Nettoyer même en cas d'erreur
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

            console.log('🔄 AuthContext: Refreshing user info...');

            const result = await refreshMutation.mutateAsync();

            // 🆕 Log des informations de rôle après refresh
            if (result.localUser.role_info) {
                console.log('👤 AuthContext: Refreshed user role info:', {
                    user: currentUserLogin,
                    role: result.localUser.role_info.role,
                    isAdmin: result.localUser.role_info.is_admin,
                    isSuperAdmin: result.localUser.role_info.is_super_admin
                });
            }

            console.log('🔄 AuthContext: User info refreshed successfully');

            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur de récupération des données';
            setError(errorMessage);
            console.error('❌ AuthContext: Refresh user info error:', err);
            throw err;
        }
    }, [refreshMutation, isAuthenticated, currentUserLogin]);

    // ✅ Wrapper pour switch user
    const switchUser = useCallback(async (credentials: LoginRequest) => {
        try {
            console.log('🔄 AuthContext: Switching user...');

            const result = await switchUserMutation.mutateAsync(credentials);
            setCurrentUserLogin(credentials.bet_login);
            setError(null);

            console.log('🔄 AuthContext: User switched successfully');

            return {
                success: true,
                localUser: userInfoQuery.data,
                bet261User: bet261DataQuery.data,
                loginResponse: result
            };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur de changement d\'utilisateur';
            setError(errorMessage);
            console.error('❌ AuthContext: Switch user error:', err);

            return { success: false, error: errorMessage };
        }
    }, [switchUserMutation, userInfoQuery, bet261DataQuery]);

    // ✅ Nettoyer les données quand l'utilisateur se déconnecte
    useEffect(() => {
        if (!authService.getAuthToken()) {
            console.log('🧹 AuthContext: Token cleared, resetting state');
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
        console.log('🔍 AuthContext state changed:', {
            isAuthenticated,
            hasLocalUserInfo: !!localUserInfo,
            hasBet261UserData: !!bet261UserData,
            loading,
            currentUserLogin,
            userRole,
            isAdmin,
            isSuperAdmin,
            canAccessAdminPanel: canAccessAdminPanel(),
            error
        });
    }, [isAuthenticated, localUserInfo, bet261UserData, loading, currentUserLogin, userRole, isAdmin, isSuperAdmin, canAccessAdminPanel, error]);

    const value: AuthContextType = {
        // États de base
        loading,
        localUserInfo,
        bet261UserData,
        isAuthenticated,
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