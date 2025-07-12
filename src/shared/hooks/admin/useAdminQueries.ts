// src/shared/hooks/admin/useAdminQueries.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/src/shared/services/api/admin/admin.api';
import {
    AdminListResponse,
    UsersListResponse,
    UserRole,
    PromoteRequest,
    DemoteRequest,
    PromoteResponse,
    DemoteResponse,
    SystemStatus,
    AuthenticatedUsersResponse
} from '@/src/features/admin/types/admin.types';

// 🔑 Query Keys - Centralisés pour la gestion du cache
export const adminKeys = {
    all: ['admin'] as const,
    myRole: () => [...adminKeys.all, 'myRole'] as const,
    userRole: (betLogin: string) => [...adminKeys.all, 'userRole', betLogin] as const,
    allUsers: () => [...adminKeys.all, 'allUsers'] as const,
    userInfo: (betLogin: string) => [...adminKeys.all, 'userInfo', betLogin] as const,
    allAdmins: () => [...adminKeys.all, 'allAdmins'] as const,
    authenticatedUsers: () => [...adminKeys.all, 'authenticatedUsers'] as const,
    systemStatus: () => [...adminKeys.all, 'systemStatus'] as const,
    searchUsers: (query: string, role?: string) => [...adminKeys.all, 'searchUsers', query, role] as const,
} as const;

// ===================================================================
// HOOKS POUR LES RÔLES
// ===================================================================

/**
 * Hook pour récupérer mon rôle
 */
export function useMyRole() {
    return useQuery({
        queryKey: adminKeys.myRole(),
        queryFn: () => adminService.getMyRole(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000,   // 10 minutes
        retry: (failureCount, error: any) => {
            if (error?.message?.includes('401') || error?.message?.includes('403')) {
                return false;
            }
            return failureCount < 2;
        },
    });
}

/**
 * Hook pour récupérer le rôle d'un utilisateur spécifique
 */
export function useUserRole(betLogin: string) {
    return useQuery({
        queryKey: adminKeys.userRole(betLogin),
        queryFn: () => adminService.getUserRole(betLogin),
        enabled: !!betLogin,
        staleTime: 3 * 60 * 1000, // 3 minutes
        gcTime: 5 * 60 * 1000,    // 5 minutes
    });
}

// ===================================================================
// HOOKS POUR LES UTILISATEURS
// ===================================================================

/**
 * Hook pour récupérer tous les utilisateurs
 */
export function useAllUsers() {
    return useQuery({
        queryKey: adminKeys.allUsers(),
        queryFn: () => adminService.getAllUsers(),
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 5 * 60 * 1000,    // 5 minutes
        retry: 2,
    });
}

/**
 * Hook pour récupérer les informations d'un utilisateur
 */
export function useUserInfo(betLogin: string) {
    return useQuery({
        queryKey: adminKeys.userInfo(betLogin),
        queryFn: () => adminService.getUserInfo(betLogin),
        enabled: !!betLogin,
        staleTime: 1 * 60 * 1000, // 1 minute
        gcTime: 3 * 60 * 1000,    // 3 minutes
    });
}

/**
 * Hook pour récupérer les utilisateurs connectés
 */
export function useAuthenticatedUsers() {
    return useQuery({
        queryKey: adminKeys.authenticatedUsers(),
        queryFn: () => adminService.getAuthenticatedUsers(),
        staleTime: 30 * 1000,     // 30 secondes
        gcTime: 2 * 60 * 1000,    // 2 minutes
        refetchInterval: 60 * 1000, // Actualisation automatique toutes les minutes
    });
}

/**
 * Hook pour rechercher des utilisateurs
 */
export function useSearchUsers(query: string, role?: string) {
    return useQuery({
        queryKey: adminKeys.searchUsers(query, role),
        queryFn: () => adminService.searchUsers(query, role),
        enabled: query.length >= 2, // Recherche seulement si au moins 2 caractères
        staleTime: 1 * 60 * 1000,   // 1 minute
        gcTime: 3 * 60 * 1000,      // 3 minutes
    });
}

// ===================================================================
// HOOKS POUR LES ADMINISTRATEURS
// ===================================================================

/**
 * Hook pour récupérer tous les administrateurs
 */
export function useAllAdmins() {
    return useQuery({
        queryKey: adminKeys.allAdmins(),
        queryFn: () => adminService.getAllAdmins(),
        staleTime: 3 * 60 * 1000, // 3 minutes
        gcTime: 10 * 60 * 1000,   // 10 minutes
        retry: 2,
    });
}

/**
 * Hook pour promouvoir un utilisateur
 */
export function usePromoteUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (request: PromoteRequest) => adminService.promoteToAdmin(request),
        onSuccess: (data, variables) => {
            console.log('✅ Promotion réussie:', data);

            // Invalider les caches pertinents
            queryClient.invalidateQueries({ queryKey: adminKeys.allUsers() });
            queryClient.invalidateQueries({ queryKey: adminKeys.allAdmins() });
            queryClient.invalidateQueries({ queryKey: adminKeys.userRole(variables.bet_login) });
            queryClient.invalidateQueries({ queryKey: adminKeys.systemStatus() });

            // Optionnel: Mettre à jour directement le cache des utilisateurs
            queryClient.setQueryData<UsersListResponse>(adminKeys.allUsers(), (oldData) => {
                if (!oldData) return oldData;

                return {
                    ...oldData,
                    users: oldData.users.map(user =>
                        user.bet_login.toString() === variables.bet_login
                            ? { ...user, role: 'admin' as const, is_admin: true }
                            : user
                    )
                };
            });
        },
        onError: (error) => {
            console.error('❌ Erreur promotion:', error);
        },
    });
}

/**
 * Hook pour rétrograder un administrateur
 */
export function useDemoteUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (request: DemoteRequest) => adminService.demoteFromAdmin(request),
        onSuccess: (data, variables) => {
            console.log('✅ Rétrogradation réussie:', data);

            // Invalider les caches pertinents
            queryClient.invalidateQueries({ queryKey: adminKeys.allUsers() });
            queryClient.invalidateQueries({ queryKey: adminKeys.allAdmins() });
            queryClient.invalidateQueries({ queryKey: adminKeys.userRole(variables.bet_login) });
            queryClient.invalidateQueries({ queryKey: adminKeys.systemStatus() });

            // Optionnel: Mettre à jour directement le cache des utilisateurs
            queryClient.setQueryData<UsersListResponse>(adminKeys.allUsers(), (oldData) => {
                if (!oldData) return oldData;

                return {
                    ...oldData,
                    users: oldData.users.map(user =>
                        user.bet_login.toString() === variables.bet_login
                            ? { ...user, role: 'user' as const, is_admin: false, is_super_admin: false }
                            : user
                    )
                };
            });

            // Supprimer de la liste des admins
            queryClient.setQueryData<AdminListResponse>(adminKeys.allAdmins(), (oldData) => {
                if (!oldData) return oldData;

                return {
                    ...oldData,
                    admins: oldData.admins.filter(admin => admin.bet_login !== variables.bet_login),
                    total_count: oldData.total_count - 1,
                    regular_admins: oldData.regular_admins - 1
                };
            });
        },
        onError: (error) => {
            console.error('❌ Erreur rétrogradation:', error);
        },
    });
}

// ===================================================================
// HOOKS POUR LE SYSTÈME
// ===================================================================

/**
 * Hook pour récupérer le statut du système
 */
export function useSystemStatus() {
    return useQuery({
        queryKey: adminKeys.systemStatus(),
        queryFn: () => adminService.getSystemStatus(),
        staleTime: 1 * 60 * 1000, // 1 minute
        gcTime: 5 * 60 * 1000,    // 5 minutes
        refetchInterval: 2 * 60 * 1000, // Actualisation automatique toutes les 2 minutes
    });
}

// ===================================================================
// HOOKS UTILITAIRES
// ===================================================================

/**
 * Hook pour vérifier les permissions administrateur
 */
export function useAdminPermissions() {
    const myRole = useMyRole();

    return {
        isAdmin: myRole.data?.is_admin ?? false,
        isSuperAdmin: myRole.data?.is_super_admin ?? false,
        canPromote: myRole.data?.is_admin ?? false,
        canDemote: myRole.data?.is_admin ?? false,
        canViewAdminPanel: myRole.data?.is_admin ?? false,
        isLoading: myRole.isLoading,
        error: myRole.error,
    };
}

/**
 * Hook pour les actions administrateur avec validation
 */
export function useAdminActions() {
    const promoteUser = usePromoteUser();
    const demoteUser = useDemoteUser();
    const permissions = useAdminPermissions();

    const handlePromote = async (betLogin: string, notes?: string) => {
        if (!permissions.canPromote) {
            throw new Error('Permissions insuffisantes pour promouvoir un utilisateur');
        }

        return await promoteUser.mutateAsync({ bet_login: betLogin, notes });
    };

    const handleDemote = async (betLogin: string) => {
        if (!permissions.canDemote) {
            throw new Error('Permissions insuffisantes pour rétrograder un utilisateur');
        }

        return await demoteUser.mutateAsync({ bet_login: betLogin });
    };

    return {
        promoteUser: handlePromote,
        demoteUser: handleDemote,
        isPromoting: promoteUser.isPending,
        isDemoting: demoteUser.isPending,
        isLoading: promoteUser.isPending || demoteUser.isPending,
        permissions,
    };
}

/**
 * Hook pour rafraîchir toutes les données admin
 */
export function useRefreshAdminData() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            // Invalider toutes les queries admin
            await queryClient.invalidateQueries({ queryKey: adminKeys.all });

            // Attendre que les nouvelles données soient chargées
            await Promise.all([
                queryClient.refetchQueries({ queryKey: adminKeys.allUsers() }),
                queryClient.refetchQueries({ queryKey: adminKeys.allAdmins() }),
                queryClient.refetchQueries({ queryKey: adminKeys.systemStatus() }),
                queryClient.refetchQueries({ queryKey: adminKeys.authenticatedUsers() }),
            ]);
        },
        onSuccess: () => {
            console.log('✅ Données admin rafraîchies');
        },
        onError: (error) => {
            console.error('❌ Erreur rafraîchissement données admin:', error);
        },
    });
}