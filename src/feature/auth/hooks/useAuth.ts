// src/features/auth/hooks/useAuth.ts
import { useState } from 'react';
import { authService,  UserInfo} from '@/src/shared/services/api/auth/auth.api';

export function useAuth() {
    const [loading, setLoading] = useState(false);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const login = async () => {
        try {
            setLoading(true);
            setError(null);

            // Appel de l'API de login
            const loginResponse = await authService.login();
            console.log('Login response:', loginResponse);

            // Récupération des informations utilisateur
            const userInfoResponse = await authService.getUserInfo();
            console.log('User info:', userInfoResponse);

            setUserInfo(userInfoResponse);
            setIsAuthenticated(true);

            return { success: true, userInfo: userInfoResponse };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur de connexion';
            setError(errorMessage);
            console.error('Login error:', err);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setUserInfo(null);
        setIsAuthenticated(false);
        setError(null);
    };

    const refreshUserInfo = async () => {
        try {
            setLoading(true);
            const userInfoResponse = await authService.getUserInfo();
            setUserInfo(userInfoResponse);
            return userInfoResponse;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur de récupération des données';
            setError(errorMessage);
            console.error('Refresh user info error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        userInfo,
        isAuthenticated,
        error,
        login,
        logout,
        refreshUserInfo,
    };
}