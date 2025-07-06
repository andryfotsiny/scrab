// src/features/auth/hooks/useAuth.ts
import { useState } from 'react';
import { authService } from '@/src/shared/services/api/auth/auth.api';
import { LoginRequest, LocalUserInfo, Bet261UserData } from '@/src/features/auth/types';

export function useAuth() {
    const [loading, setLoading] = useState(false);
    const [localUserInfo, setLocalUserInfo] = useState<LocalUserInfo | null>(null);
    const [bet261UserData, setBet261UserData] = useState<Bet261UserData | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentUserLogin, setCurrentUserLogin] = useState<string | null>(null);

    const login = async (credentials: LoginRequest) => {
        try {
            setLoading(true);
            setError(null);

            console.log('🔐 Starting login process for:', credentials.bet_login);

            // Appel de l'API de login
            const loginResponse = await authService.login(credentials);
            console.log('✅ Login response:', loginResponse);

            if (!loginResponse.success) {
                throw new Error(loginResponse.message || 'Erreur de connexion');
            }

            // Récupération des informations utilisateur local
            const localUserResponse = await authService.getUserInfo();
            console.log('📋 Local user info:', localUserResponse);

            // Récupération des données Bet261
            const bet261Response = await authService.getBet261UserInfo();
            console.log('🎯 Bet261 user data:', bet261Response);

            setLocalUserInfo(localUserResponse);
            setBet261UserData(bet261Response);
            setIsAuthenticated(true);
            setCurrentUserLogin(credentials.bet_login);

            return {
                success: true,
                localUser: localUserResponse,
                bet261User: bet261Response,
                loginResponse
            };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur de connexion';
            setError(errorMessage);
            console.error('❌ Login error:', err);

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
    };

    const logout = async () => {
        try {
            setLoading(true);

            if (isAuthenticated) {
                await authService.logout();
                console.log('✅ User logged out successfully');
            }
        } catch (err) {
            console.error('⚠️ Logout error:', err);
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
        }
    };

    const refreshUserInfo = async () => {
        try {
            setLoading(true);
            setError(null);

            if (!isAuthenticated) {
                throw new Error('Utilisateur non connecté');
            }

            // Refresh local user info
            const localUserResponse = await authService.getUserInfo();
            console.log('🔄 Refreshed local user info:', localUserResponse);

            // Refresh Bet261 user data
            const bet261Response = await authService.getBet261UserInfo();
            console.log('🔄 Refreshed Bet261 user data:', bet261Response);

            setLocalUserInfo(localUserResponse);
            setBet261UserData(bet261Response);

            return { localUser: localUserResponse, bet261User: bet261Response };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur de récupération des données';
            setError(errorMessage);
            console.error('❌ Refresh user info error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const switchUser = async (credentials: LoginRequest) => {
        // Logout current user first
        await logout();

        // Login with new credentials
        return await login(credentials);
    };

    return {
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
}