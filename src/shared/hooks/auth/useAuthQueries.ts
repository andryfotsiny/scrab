// src/shared/hooks/auth/useAuthQueries.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/src/shared/services/api/auth/auth.api';
import { LoginRequest, LocalUserInfo, Bet261UserData } from '@/src/features/auth/types';

// 🔑 Query Keys - Centralisés pour éviter les erreurs
export const authKeys = {
    all: ['auth'] as const,
    userInfo: () => [...authKeys.all, 'userInfo'] as const,
    bet261UserData: () => [...authKeys.all, 'bet261UserData'] as const,
    configuration: () => [...authKeys.all, 'configuration'] as const,
} as const;

// 🔐 Hook: Login
export function useLogin() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (credentials: LoginRequest) => {
            const loginResponse = await authService.login(credentials);

            if (!loginResponse.success) {
                throw new Error(loginResponse.message || 'Erreur de connexion');
            }

            return loginResponse;
        },
        onSuccess: (data, variables) => {

            // 🚀 Prefetch des données utilisateur après login réussi
            queryClient.prefetchQuery({
                queryKey: authKeys.userInfo(),
                queryFn: () => authService.getUserInfo(),
                staleTime: 5 * 60 * 1000, // 5 minutes
            });

            queryClient.prefetchQuery({
                queryKey: authKeys.bet261UserData(),
                queryFn: () => authService.getBet261UserInfo(),
                staleTime: 5 * 60 * 1000, // 5 minutes
            });
        },
        onError: (error) => {
            console.error('Login failed:', error);
            // Nettoyer le cache en cas d'erreur
            queryClient.removeQueries({ queryKey: authKeys.all });
        },
    });
}

// 📋 Hook: User Info Local
export function useUserInfo() {
    return useQuery({
        queryKey: authKeys.userInfo(),
        queryFn: () => authService.getUserInfo(),
        enabled: !!authService.getAuthToken(), // Seulement si token existe
        staleTime: 2 * 60 * 1000, // 2 minutes pour données souvent changées
        gcTime: 5 * 60 * 1000,    // 5 minutes
        retry: (failureCount, error: any) => {
            // Pas de retry si erreur d'auth
            if (error?.message?.includes('401') || error?.message?.includes('403')) {
                return false;
            }
            return failureCount < 2;
        },
    });
}

// 🎯 Hook: Bet261 User Data
export function useBet261UserData() {
    return useQuery({
        queryKey: authKeys.bet261UserData(),
        queryFn: () => authService.getBet261UserInfo(),
        enabled: !!authService.getAuthToken(), // Seulement si token existe
        staleTime: 1 * 60 * 1000, // 1 minute pour données financières
        gcTime: 5 * 60 * 1000,    // 5 minutes
        retry: (failureCount, error: any) => {
            // Pas de retry si erreur d'auth
            if (error?.message?.includes('401') || error?.message?.includes('403')) {
                return false;
            }
            return failureCount < 2;
        },
    });
}

// ⚙️ Hook: Configuration
export function useConfiguration() {
    return useQuery({
        queryKey: authKeys.configuration(),
        queryFn: () => authService.getConfiguration(),
        enabled: !!authService.getAuthToken(),
        staleTime: 10 * 60 * 1000, // 10 minutes pour config stable
        gcTime: 30 * 60 * 1000,    // 30 minutes
    });
}

// 🔄 Hook: Refresh User Info
export function useRefreshUserInfo() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            // Forcer le refresh des deux queries
            const [localUser, bet261User] = await Promise.all([
                authService.getUserInfo(),
                authService.getBet261UserInfo(),
            ]);

            return { localUser, bet261User };
        },
        onSuccess: (data) => {
            // Mettre à jour le cache avec les nouvelles données
            queryClient.setQueryData(authKeys.userInfo(), data.localUser);
            queryClient.setQueryData(authKeys.bet261UserData(), data.bet261User);

        },
        onError: (error) => {
            console.error('Refresh user info failed:', error);
        },
    });
}

// 🚪 Hook: Logout
export function useLogout() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            try {
                // Tenter logout côté serveur
                if (authService.getAuthToken()) {
                    await authService.logout();
                }
            } catch (error) {
                // Continuer même si logout serveur échoue
                console.warn('Server logout failed, proceeding with local cleanup:', error);
            }

            // Toujours nettoyer localement
            authService.clearAuthToken();
        },
        onSuccess: () => {
            // Vider TOUT le cache (matchs Grolo/Mini, statut Aviator, solde...) : les clés ne sont pas
            // propres à un utilisateur, le suivant verrait sinon les données du précédent.
            queryClient.clear();

        },
        onError: (error) => {
            console.error('Logout error:', error);

            // Nettoyer quand même en cas d'erreur
            authService.clearAuthToken();
            queryClient.clear();
        },
    });
}

// 🔄 Hook: Switch User
export function useSwitchUser() {
    const queryClient = useQueryClient();
    const logout = useLogout();
    const login = useLogin();

    return useMutation({
        mutationFn: async (credentials: LoginRequest) => {
            // 1. Logout de l'utilisateur actuel
            await logout.mutateAsync();

            // 2. Login avec les nouveaux credentials
            return await login.mutateAsync(credentials);
        },
        onSuccess: () => {
        },
        onError: (error) => {
            console.error('Switch user failed:', error);
        },
    });
}

// 🛠️ Hook: Utilitaires
export function useAuthUtils() {
    const queryClient = useQueryClient();

    return {
        // Invalider et refetch toutes les données auth
        invalidateAuth: () => {
            queryClient.invalidateQueries({ queryKey: authKeys.all });
        },

        // Prefetch des données auth
        prefetchUserData: () => {
            queryClient.prefetchQuery({
                queryKey: authKeys.userInfo(),
                queryFn: () => authService.getUserInfo(),
            });

            queryClient.prefetchQuery({
                queryKey: authKeys.bet261UserData(),
                queryFn: () => authService.getBet261UserInfo(),
            });
        },

        // Nettoyer le cache auth
        clearAuthCache: () => {
            queryClient.removeQueries({ queryKey: authKeys.all });
        },

        // Vérifier si les données sont en cache
        hasUserData: () => {
            const userInfo = queryClient.getQueryData(authKeys.userInfo());
            const bet261Data = queryClient.getQueryData(authKeys.bet261UserData());
            return !!(userInfo && bet261Data);
        },
    };
}