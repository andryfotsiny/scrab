// src/shared/context/AuthContext.tsx - SIMPLIFIED avec React Query
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authService } from '@/src/shared/services/api/auth/auth.api';
import { LoginRequest, LocalUserInfo, Bet261UserData } from '@/src/features/auth/types';
import {
    useLogin,
    useLogout,
    useUserInfo,
    useBet261UserData,
    useRefreshUserInfo,
    useSwitchUser,
    useAuthUtils
} from '@/src/shared/hooks/auth/useAuthQueries';

interface AuthContextType {
    // ✅ États simplifiés - React Query gère le cache
    loading: boolean;
    localUserInfo: LocalUserInfo | null;
    bet261UserData: Bet261UserData | null;
    isAuthenticated: boolean;
    error: string | null;
    currentUserLogin: string | null;

    // ✅ Actions - utilise React Query hooks
    login: (credentials: LoginRequest) => Promise<{ success: boolean; error?: string; localUser?: LocalUserInfo; bet261User?: Bet261UserData; loginResponse?: any }>;
    logout: () => Promise<void>;
    refreshUserInfo: () => Promise<{ localUser: LocalUserInfo; bet261User: Bet261UserData }>;
    switchUser: (credentials: LoginRequest) => Promise<{ success: boolean; error?: string; localUser?: LocalUserInfo; bet261User?: Bet261UserData; loginResponse?: any }>;
}

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

    // ✅ Wrapper pour login
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

            console.log('🔄 AuthContext: User info refreshed successfully');

            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur de récupération des données';
            setError(errorMessage);
            console.error('❌ AuthContext: Refresh user info error:', err);
            throw err;
        }
    }, [refreshMutation, isAuthenticated]);

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
    }, [authService.getAuthToken()]);

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

    // ✅ Debug effect - réduit pour éviter le spam
    useEffect(() => {
        console.log('🔍 AuthContext state changed:', {
            isAuthenticated,
            hasLocalUserInfo: !!localUserInfo,
            hasBet261UserData: !!bet261UserData,
            loading,
            currentUserLogin,
            error
        });
    }, [isAuthenticated, localUserInfo, bet261UserData, loading, currentUserLogin, error]);

    const value: AuthContextType = {
        loading,
        localUserInfo,
        bet261UserData,
        isAuthenticated,
        error,
        currentUserLogin,
        login,
        logout,
        refreshUserInfo,
        switchUser,
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