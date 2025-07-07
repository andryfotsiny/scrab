// src/shared/hooks/useSessionManager.ts - VERSION SIMPLIFIÉE (optionnelle)
import { useEffect, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useAuth } from '@/src/shared/context/AuthContext';

interface SessionManagerConfig {
    onSessionExpired?: () => void;
    onSessionRefreshed?: () => void;
}

export function useSessionManager(config: SessionManagerConfig = {}) {
    const { isAuthenticated } = useAuth();

    const {
        onSessionExpired,
        onSessionRefreshed
    } = config;

    /**
     * ✅ Version simplifiée - juste pour les callbacks
     */
    const refreshSession = useCallback(async (): Promise<boolean> => {
        // Cette méthode est maintenant handled par apiClient automatiquement
        console.log('🔄 SessionManager: Refresh géré automatiquement par apiClient');
        return true;
    }, []);

    const checkSessionStatus = useCallback(async () => {
        // Cette méthode est maintenant handled par apiClient automatiquement
        console.log('🔍 SessionManager: Vérification gérée automatiquement par apiClient');
    }, []);

    const startSessionMonitoring = useCallback(() => {
        console.log('🔄 SessionManager: Surveillance gérée automatiquement par apiClient');
    }, []);

    const stopSessionMonitoring = useCallback(() => {
        console.log('🛑 SessionManager: Surveillance gérée automatiquement par apiClient');
    }, []);

    return {
        checkSessionStatus,
        refreshSession,
        startSessionMonitoring,
        stopSessionMonitoring
    };
}

// ✅ Hook spécialisé simplifié
export function useAuthenticatedScreen() {
    const { isAuthenticated } = useAuth();

    const sessionManager = useSessionManager({
        onSessionExpired: () => {
            console.log('🚪 useAuthenticatedScreen: Session gérée automatiquement');
        },
        onSessionRefreshed: () => {
            console.log('🔄 useAuthenticatedScreen: Session gérée automatiquement');
        }
    });

    return {
        isAuthenticated,
        ...sessionManager
    };
}