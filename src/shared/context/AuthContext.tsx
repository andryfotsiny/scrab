// src/shared/context/AuthContext.tsx
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authService } from '@/src/shared/services/api/auth/auth.api';
import { LoginRequest, LocalUserInfo, Bet261UserData } from '@/src/features/auth/types';

interface AuthContextType {
    loading: boolean;
    localUserInfo: LocalUserInfo | null;
    bet261UserData: Bet261UserData | null;
    isAuthenticated: boolean;
    error: string | null;
    currentUserLogin: string | null;
    login: (credentials: LoginRequest) => Promise<{ success: boolean; error?: string; localUser?: LocalUserInfo; bet261User?: Bet261UserData; loginResponse?: any }>;
    logout: () => Promise<void>;
    refreshUserInfo: () => Promise<{ localUser: LocalUserInfo; bet261User: Bet261UserData }>;
    switchUser: (credentials: LoginRequest) => Promise<{ success: boolean; error?: string; localUser?: LocalUserInfo; bet261User?: Bet261UserData; loginResponse?: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(false);
    const [localUserInfo, setLocalUserInfo] = useState<LocalUserInfo | null>(null);
    const [bet261UserData, setBet261UserData] = useState<Bet261UserData | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentUserLogin, setCurrentUserLogin] = useState<string | null>(null);

    const login = useCallback(async (credentials: LoginRequest) => {
        try {
            setLoading(true);
            setError(null);

            console.log('🔐 AuthContext: Starting login process for:', credentials.bet_login);

            // Appel de l'API de login
            const loginResponse = await authService.login(credentials);
            console.log('✅ AuthContext: Login response:', loginResponse);

            if (!loginResponse.success) {
                throw new Error(loginResponse.message || 'Erreur de connexion');
            }

            // Récupération des informations utilisateur local
            const localUserResponse = await authService.getUserInfo();
            console.log('📋 AuthContext: Local user info:', localUserResponse);

            // Récupération des données Bet261
            const bet261Response = await authService.getBet261UserInfo();
            console.log('🎯 AuthContext: Bet261 user data:', bet261Response);

            // Mise à jour de l'état global
            setLocalUserInfo(localUserResponse);
            setBet261UserData(bet261Response);
            setIsAuthenticated(true);
            setCurrentUserLogin(credentials.bet_login);

            console.log('🎉 AuthContext: Authentication state updated successfully');

            return {
                success: true,
                localUser: localUserResponse,
                bet261User: bet261Response,
                loginResponse
            };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur de connexion';
            setError(errorMessage);
            console.error('❌ AuthContext: Login error:', err);

            // Clear auth state on error
            setLocalUserInfo(null);
            setBet261UserData(null);
            setIsAuthenticated(false);
            setCurrentUserLogin(null);
            authService.clearAuthToken();

            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            setLoading(true);

            if (isAuthenticated) {
                await authService.logout();
                console.log('✅ AuthContext: User logged out successfully');
            }
        } catch (err) {
            console.error('⚠️ AuthContext: Logout error:', err);
            // Continue with local logout even if API call fails
        } finally {
            // Always clear local state
            setLocalUserInfo(null);
            setBet261UserData(null);
            setIsAuthenticated(false);
            setCurrentUserLogin(null);
            setError(null);
            authService.clearAuthToken();
            setLoading(false);
            console.log('🧹 AuthContext: Authentication state cleared');
        }
    }, [isAuthenticated]);

    const refreshUserInfo = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            if (!isAuthenticated) {
                throw new Error('Utilisateur non connecté');
            }

            console.log('🔄 AuthContext: Refreshing user info...');

            // Refresh local user info
            const localUserResponse = await authService.getUserInfo();
            console.log('🔄 AuthContext: Refreshed local user info:', localUserResponse);

            // Refresh Bet261 user data
            const bet261Response = await authService.getBet261UserInfo();
            console.log('🔄 AuthContext: Refreshed Bet261 user data:', bet261Response);

            setLocalUserInfo(localUserResponse);
            setBet261UserData(bet261Response);

            return { localUser: localUserResponse, bet261User: bet261Response };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur de récupération des données';
            setError(errorMessage);
            console.error('❌ AuthContext: Refresh user info error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    const switchUser = useCallback(async (credentials: LoginRequest) => {
        // Logout current user first
        await logout();

        // Login with new credentials
        return await login(credentials);
    }, [logout, login]);

    // Debug effect
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