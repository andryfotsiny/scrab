// src/shared/hooks/subscription/useSubscriptionQueries.ts - VERSION COMPLÈTE CORRIGÉE

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    subscriptionService,
    ActivateAccountRequest,
    ExtendTrialRequest,
    SubscriptionStatusResponse,
    AllUsersSubscriptionResponse,
    SubscriptionActionResponse,
    SubscriptionInfo
} from '@/src/shared/services/api/subscription/subscription.api';

// 🔑 Query Keys - Centralisés pour la gestion du cache
export const subscriptionKeys = {
    all: ['subscription'] as const,
    myStatus: () => [...subscriptionKeys.all, 'myStatus'] as const,
    userStatus: (betLogin: string) => [...subscriptionKeys.all, 'userStatus', betLogin] as const,
    allUsersStatus: () => [...subscriptionKeys.all, 'allUsersStatus'] as const,
    premiumAccess: () => [...subscriptionKeys.all, 'premiumAccess'] as const,
    subscriptionInfo: () => [...subscriptionKeys.all, 'subscriptionInfo'] as const,
} as const;

// ===================================================================
// HOOKS POUR LA CONSULTATION DES STATUTS
// ===================================================================

/**
 * Hook pour récupérer mon statut d'abonnement
 */
export function useMySubscriptionStatus() {
    return useQuery({
        queryKey: subscriptionKeys.myStatus(),
        queryFn: () => subscriptionService.getMySubscriptionStatus(),
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 5 * 60 * 1000,    // 5 minutes
        retry: (failureCount, error: any) => {
            if (error?.message?.includes('401') || error?.message?.includes('403')) {
                return false;
            }
            return failureCount < 2;
        },
    });
}

/**
 * Hook pour récupérer le statut d'abonnement d'un utilisateur spécifique
 */
export function useUserSubscriptionStatus(betLogin: string) {
    return useQuery({
        queryKey: subscriptionKeys.userStatus(betLogin),
        queryFn: () => subscriptionService.getUserSubscriptionStatus(betLogin),
        enabled: !!betLogin,
        staleTime: 1 * 60 * 1000, // 1 minute
        gcTime: 3 * 60 * 1000,    // 3 minutes
    });
}

/**
 * Hook pour vérifier l'accès premium de l'utilisateur connecté
 */
export function usePremiumAccess() {
    return useQuery({
        queryKey: subscriptionKeys.premiumAccess(),
        queryFn: () => subscriptionService.checkPremiumAccess(),
        staleTime: 1 * 60 * 1000, // 1 minute
        gcTime: 3 * 60 * 1000,    // 3 minutes
        retry: (failureCount, error: any) => {
            if (error?.message?.includes('401') || error?.message?.includes('403')) {
                return false;
            }
            return failureCount < 2;
        },
    });
}

/**
 * Hook pour récupérer les informations générales sur le système d'abonnement
 */
export function useSubscriptionInfo() {
    return useQuery({
        queryKey: subscriptionKeys.subscriptionInfo(),
        queryFn: () => subscriptionService.getSubscriptionInfo(),
        staleTime: 30 * 60 * 1000, // 30 minutes
        gcTime: 60 * 60 * 1000,    // 1 heure
    });
}

// ===================================================================
// HOOKS POUR L'ADMINISTRATION
// ===================================================================

/**
 * Hook pour récupérer le statut d'abonnement de tous les utilisateurs (Admin seulement)
 */
export function useAllUsersSubscriptionStatus() {
    return useQuery({
        queryKey: subscriptionKeys.allUsersStatus(),
        queryFn: () => subscriptionService.getAllUsersSubscriptionStatus(),
        staleTime: 1 * 60 * 1000, // 1 minute
        gcTime: 5 * 60 * 1000,    // 5 minutes
        retry: 2,
        refetchInterval: 2 * 60 * 1000, // Actualisation automatique toutes les 2 minutes
    });
}

/**
 * Hook pour activer le mode payant d'un utilisateur - CORRIGÉ
 */
export function useActivatePaidAccount() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (request: ActivateAccountRequest) => {
            console.log('🔧 useActivatePaidAccount - Requête reçue:', request);
            console.log('🔧 Type de bet_login:', typeof request.bet_login, '- Valeur:', request.bet_login);

            // 🔧 CORRECTION: S'assurer que bet_login est une string
            const correctedRequest = {
                ...request,
                bet_login: String(request.bet_login)
            };

            console.log('🔧 useActivatePaidAccount - Requête corrigée:', correctedRequest);

            return subscriptionService.activatePaidAccount(correctedRequest);
        },
        onSuccess: (data, variables) => {
            console.log('✅ Mode payant activé avec succès:', data);

            // Invalider les caches pertinents
            queryClient.invalidateQueries({ queryKey: subscriptionKeys.allUsersStatus() });
            queryClient.invalidateQueries({ queryKey: subscriptionKeys.userStatus(String(variables.bet_login)) });

            // Si c'est l'utilisateur connecté, invalider aussi son statut personnel
            queryClient.invalidateQueries({ queryKey: subscriptionKeys.myStatus() });
            queryClient.invalidateQueries({ queryKey: subscriptionKeys.premiumAccess() });


            // Invalider les données admin (statistiques système)
            queryClient.invalidateQueries({ queryKey: ['admin', 'systemStatus'] });
        },
        onError: (error, variables) => {
            console.error('❌ Erreur activation mode payant:', error);
            console.error('❌ Variables de la mutation:', variables);
            console.error('❌ Type de bet_login:', typeof variables.bet_login);
        },
    });
}

/**
 * Hook pour désactiver le mode payant d'un utilisateur - CORRIGÉ
 */
export function useDeactivatePaidAccount() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (request: ActivateAccountRequest) => {
            console.log('🔧 useDeactivatePaidAccount - Requête reçue:', request);
            console.log('🔧 Type de bet_login:', typeof request.bet_login, '- Valeur:', request.bet_login);

            // 🔧 CORRECTION: S'assurer que bet_login est une string
            const correctedRequest = {
                ...request,
                bet_login: String(request.bet_login)
            };

            console.log('🔧 useDeactivatePaidAccount - Requête corrigée:', correctedRequest);

            return subscriptionService.deactivatePaidAccount(correctedRequest);
        },
        onSuccess: (data, variables) => {
            console.log('✅ Mode payant désactivé avec succès:', data);

            // Invalider les caches pertinents
            queryClient.invalidateQueries({ queryKey: subscriptionKeys.allUsersStatus() });
            queryClient.invalidateQueries({ queryKey: subscriptionKeys.userStatus(String(variables.bet_login)) });

            // Si c'est l'utilisateur connecté, invalider aussi son statut personnel
            queryClient.invalidateQueries({ queryKey: subscriptionKeys.myStatus() });
            queryClient.invalidateQueries({ queryKey: subscriptionKeys.premiumAccess() });

            // Invalider les données admin (statistiques système)
            queryClient.invalidateQueries({ queryKey: ['admin', 'systemStatus'] });
        },
        onError: (error, variables) => {
            console.error('❌ Erreur désactivation mode payant:', error);
            console.error('❌ Variables de la mutation:', variables);
            console.error('❌ Type de bet_login:', typeof variables.bet_login);
        },
    });
}

/**
 * Hook pour prolonger la période gratuite d'un utilisateur - CORRIGÉ COMPLET
 */
export function useExtendTrialPeriod() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (request: ExtendTrialRequest) => {
            console.log('🔧 useExtendTrialPeriod - Requête reçue:', request);
            console.log('🔧 Type de bet_login:', typeof request.bet_login, '- Valeur:', request.bet_login);
            console.log('🔧 Type de additional_days:', typeof request.additional_days, '- Valeur:', request.additional_days);

            // 🔧 CORRECTION: S'assurer que les types sont corrects
            const correctedRequest = {
                ...request,
                bet_login: String(request.bet_login),
                additional_days: Number(request.additional_days)
            };

            console.log('🔧 useExtendTrialPeriod - Requête corrigée:', correctedRequest);

            return subscriptionService.extendTrialPeriod(correctedRequest);
        },
        onSuccess: (data, variables) => {
            console.log('✅ Période gratuite prolongée avec succès:', data);

            // Invalider les caches pertinents
            queryClient.invalidateQueries({ queryKey: subscriptionKeys.allUsersStatus() });
            queryClient.invalidateQueries({ queryKey: subscriptionKeys.userStatus(String(variables.bet_login)) });

            // Si c'est l'utilisateur connecté, invalider aussi son statut personnel
            queryClient.invalidateQueries({ queryKey: subscriptionKeys.myStatus() });
            queryClient.invalidateQueries({ queryKey: subscriptionKeys.premiumAccess() });
        },
        onError: (error, variables) => {
            console.error('❌ Erreur prolongation période gratuite:', error);
            console.error('❌ Variables de la mutation:', variables);
            console.error('❌ Type de bet_login:', typeof variables.bet_login);
            console.error('❌ Type de additional_days:', typeof variables.additional_days);
        },
    });
}

// ===================================================================
// HOOKS COMBINÉS ET UTILITAIRES - CORRIGÉS
// ===================================================================

/**
 * Hook combiné pour toutes les actions d'abonnement avec validation des permissions - CORRIGÉ
 */
export function useSubscriptionActions() {
    const activatePaid = useActivatePaidAccount();
    const deactivatePaid = useDeactivatePaidAccount();
    const extendTrial = useExtendTrialPeriod();

    const handleActivatePaid = async (betLogin: string | number, notes?: string) => {
        console.log('🔧 handleActivatePaid - Paramètres reçus:', { betLogin, notes });
        console.log('🔧 Type de betLogin:', typeof betLogin);

        // 🔧 CORRECTION: Conversion explicite en string
        const stringBetLogin = String(betLogin);
        console.log('🔧 betLogin converti:', stringBetLogin);

        return await activatePaid.mutateAsync({
            bet_login: stringBetLogin,
            notes: notes || 'Activé via interface admin'
        });
    };

    const handleDeactivatePaid = async (betLogin: string | number, notes?: string) => {
        console.log('🔧 handleDeactivatePaid - Paramètres reçus:', { betLogin, notes });
        console.log('🔧 Type de betLogin:', typeof betLogin);

        // 🔧 CORRECTION: Conversion explicite en string
        const stringBetLogin = String(betLogin);
        console.log('🔧 betLogin converti:', stringBetLogin);

        return await deactivatePaid.mutateAsync({
            bet_login: stringBetLogin,
            notes: notes || 'Désactivé via interface admin'
        });
    };

    const handleExtendTrial = async (betLogin: string | number, additionalDays: number, notes?: string) => {
        console.log('🔧 handleExtendTrial - Paramètres reçus:', { betLogin, additionalDays, notes });
        console.log('🔧 Type de betLogin:', typeof betLogin);
        console.log('🔧 Type de additionalDays:', typeof additionalDays);

        // 🔧 CORRECTION: Conversions explicites
        const stringBetLogin = String(betLogin);
        const numberAdditionalDays = Number(additionalDays);

        console.log('🔧 betLogin converti:', stringBetLogin);
        console.log('🔧 additionalDays converti:', numberAdditionalDays);

        // Validation côté client
        const validation = subscriptionService.validateTrialExtension(numberAdditionalDays);
        if (!validation.isValid) {
            throw new Error(validation.error);
        }

        return await extendTrial.mutateAsync({
            bet_login: stringBetLogin,
            additional_days: numberAdditionalDays,
            notes: notes || 'Prolongé via interface admin'
        });
    };

    return {
        activatePaid: handleActivatePaid,
        deactivatePaid: handleDeactivatePaid,
        extendTrial: handleExtendTrial,
        isActivating: activatePaid.isPending,
        isDeactivating: deactivatePaid.isPending,
        isExtending: extendTrial.isPending,
        isLoading: activatePaid.isPending || deactivatePaid.isPending || extendTrial.isPending,
    };
}

/**
 * Hook pour les statistiques d'abonnement avec formatage
 */
export function useSubscriptionStatistics() {
    const { data: allUsersData, isLoading, error } = useAllUsersSubscriptionStatus();

    const statistics = allUsersData?.data?.statistics;

    const formattedStats = statistics ? {
        totalUsers: statistics.total_users,
        paidUsers: statistics.paid_users,
        freeUsers: statistics.free_users,
        trialActive: statistics.trial_active,
        trialExpired: statistics.trial_expired,
        trialNotStarted: statistics.trial_not_started,
        conversionRate: `${statistics.conversion_rate}%`,
        paidPercentage: `${Math.round((statistics.paid_users / statistics.total_users) * 100)}%`,
        freePercentage: `${Math.round((statistics.free_users / statistics.total_users) * 100)}%`,
    } : null;

    return {
        statistics: formattedStats,
        rawStatistics: statistics,
        users: allUsersData?.data?.users || [],
        isLoading,
        error,
    };
}

/**
 * Hook pour rafraîchir toutes les données d'abonnement
 */
export function useRefreshSubscriptionData() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            // Invalider toutes les queries de subscription
            await queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });

            // Attendre que les nouvelles données soient chargées
            await Promise.all([
                queryClient.refetchQueries({ queryKey: subscriptionKeys.allUsersStatus() }),
                queryClient.refetchQueries({ queryKey: subscriptionKeys.myStatus() }),
                queryClient.refetchQueries({ queryKey: subscriptionKeys.premiumAccess() }),
            ]);
        },
        onSuccess: () => {
            console.log('✅ Données d\'abonnement rafraîchies');
        },
        onError: (error) => {
            console.error('❌ Erreur rafraîchissement données d\'abonnement:', error);
        },
    });
}

/**
 * Hook utilitaire pour les permissions d'abonnement
 */
export function useSubscriptionPermissions(userRole: 'user' | 'admin' | 'super_admin') {
    return {
        canViewAllSubscriptions: userRole === 'admin' || userRole === 'super_admin',
        canActivatePaid: userRole === 'admin' || userRole === 'super_admin',
        canDeactivatePaid: userRole === 'admin' || userRole === 'super_admin',
        canExtendTrial: userRole === 'admin' || userRole === 'super_admin',
        canViewSubscriptionStats: userRole === 'admin' || userRole === 'super_admin',
    };
}