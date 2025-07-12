// src/shared/hooks/grolo/useGroloQueries.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { footballService } from '@/src/shared/services/api/football/football.api';
import {
    FootballConfig,
    FootballMatchesResponse,
    ExecuteBetResponse,
    AutoExecutionResponse,
    ConfigUpdateRequest
} from '@/src/shared/services/types/grolo.type';

// 🔑 Query Keys - Centralisés
export const groloKeys = {
    all: ['grolo'] as const,
    config: () => [...groloKeys.all, 'config'] as const,
    matches: () => [...groloKeys.all, 'matches'] as const,
    autoExecution: () => [...groloKeys.all, 'autoExecution'] as const,
} as const;

// ⚙️ Hook: Grolo Config
export function useGroloConfig() {
    return useQuery({
        queryKey: groloKeys.config(),
        queryFn: () => footballService.getConfig(),
        staleTime: 3 * 60 * 1000,  // 3 minutes pour config
        gcTime: 10 * 60 * 1000,    // 10 minutes
        retry: (failureCount, error: any) => {
            if (error?.message?.includes('401') || error?.message?.includes('403')) {
                return false;
            }
            return failureCount < 2;
        },
    });
}

// 🏆 Hook: Grolo Matches (données publiques)
export function useGroloMatches() {
    return useQuery({
        queryKey: groloKeys.matches(),
        queryFn: () => footballService.getAllMatches(),
        staleTime: 30 * 1000,      // 30 secondes pour matchs
        gcTime: 5 * 60 * 1000,     // 5 minutes
        refetchInterval: 60 * 1000, // Auto-refresh toutes les minutes
        retry: (failureCount, error: any) => {
            // Pas besoin d'auth pour les matchs, retry plus agressif
            return failureCount < 3;
        },
    });
}

// 🔧 Hook: Update Grolo Config
export function useUpdateGroloConfig() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (updates: ConfigUpdateRequest) => {
            console.log('🔧 Updating grolo config:', updates);
            return footballService.updateConfig(updates);
        },
        onSuccess: (data, variables) => {
            console.log('✅ Grolo config updated successfully:', data);

            // Mettre à jour le cache avec la nouvelle config
            if (data.new_config) {
                const updatedConfig: FootballConfig = {
                    ...data.new_config,
                    metadata: data.metadata || data.new_config.metadata,
                };

                queryClient.setQueryData(groloKeys.config(), updatedConfig);
            }

            // Invalider les matchs car la config peut affecter la sélection
            queryClient.invalidateQueries({ queryKey: groloKeys.matches() });
        },
        onError: (error) => {
            console.error('❌ Grolo config update failed:', error);
        },
    });
}

// 🎯 Hook: Execute Grolo Bet
export function useExecuteGroloBet() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ stake, acceptOddsChange = true }: { stake: number; acceptOddsChange?: boolean }) => {
            console.log('🎯 Executing grolo bet:', { stake, acceptOddsChange });
            return footballService.executeBet(stake, acceptOddsChange);
        },
        onSuccess: (data) => {
            console.log('✅ Grolo bet executed successfully:', data);

            // Invalider les matchs pour récupérer les nouveaux
            queryClient.invalidateQueries({ queryKey: groloKeys.matches() });

            // Optionnel: invalider les données utilisateur pour le nouveau solde
            queryClient.invalidateQueries({ queryKey: ['auth', 'bet261UserData'] });
        },
        onError: (error) => {
            console.error('❌ Grolo bet execution failed:', error);
        },
    });
}

// 🔄 Hook: Start Auto Execution
export function useStartGroloAutoExecution() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => {
            console.log('🔄 Starting grolo auto execution...');
            return footballService.startAutoExecution();
        },
        onSuccess: (data) => {
            console.log('✅ Grolo auto execution started:', data);

            // Mettre à jour le statut dans le cache
            queryClient.setQueryData(groloKeys.autoExecution(), data);
        },
        onError: (error) => {
            console.error('❌ Start grolo auto execution failed:', error);
        },
    });
}

// ⏹️ Hook: Stop Auto Execution
export function useStopGroloAutoExecution() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => {
            console.log('⏹️ Stopping grolo auto execution...');
            return footballService.stopAutoExecution();
        },
        onSuccess: (data) => {
            console.log('✅ Grolo auto execution stopped:', data);

            // Mettre à jour le statut dans le cache
            queryClient.setQueryData(groloKeys.autoExecution(), data);
        },
        onError: (error) => {
            console.error('❌ Stop grolo auto execution failed:', error);
        },
    });
}

// 🛠️ Hook: Grolo Utilities
export function useGroloUtils() {
    const queryClient = useQueryClient();

    return {
        // Invalider toutes les données grolo
        invalidateAll: () => {
            queryClient.invalidateQueries({ queryKey: groloKeys.all });
        },

        // Invalider seulement la config
        invalidateConfig: () => {
            queryClient.invalidateQueries({ queryKey: groloKeys.config() });
        },

        // Invalider seulement les matchs
        invalidateMatches: () => {
            queryClient.invalidateQueries({ queryKey: groloKeys.matches() });
        },

        // Prefetch des données grolo
        prefetchGroloData: () => {
            queryClient.prefetchQuery({
                queryKey: groloKeys.config(),
                queryFn: () => footballService.getConfig(),
            });

            queryClient.prefetchQuery({
                queryKey: groloKeys.matches(),
                queryFn: () => footballService.getAllMatches(),
            });
        },

        // Nettoyer le cache grolo
        clearGroloCache: () => {
            queryClient.removeQueries({ queryKey: groloKeys.all });
        },

        // Vérifier si les données sont en cache
        hasGroloData: () => {
            const config = queryClient.getQueryData(groloKeys.config());
            const matches = queryClient.getQueryData(groloKeys.matches());
            return !!(config && matches);
        },

        // Forcer refresh des matchs
        refreshMatches: () => {
            return queryClient.refetchQueries({ queryKey: groloKeys.matches() });
        },

        // Forcer refresh de la config
        refreshConfig: () => {
            return queryClient.refetchQueries({ queryKey: groloKeys.config() });
        },
    };
}

// 🎯 Hook: Combined Grolo Data (pour remplacer le contexte)
export function useGroloData() {
    const configQuery = useGroloConfig();
    const matchesQuery = useGroloMatches();
    const updateConfig = useUpdateGroloConfig();
    const executeBet = useExecuteGroloBet();
    const startAuto = useStartGroloAutoExecution();
    const stopAuto = useStopGroloAutoExecution();
    const utils = useGroloUtils();

    // État de l'auto-execution (peut être stocké dans le cache)
    const queryClient = useQueryClient();
    const autoExecutionData = queryClient.getQueryData(groloKeys.autoExecution()) as AutoExecutionResponse | undefined;

    return {
        // Données
        config: configQuery.data,
        matches: matchesQuery.data,
        autoExecutionActive: autoExecutionData?.auto_execution_active ?? false,

        // États de chargement
        loading: configQuery.isLoading || matchesQuery.isLoading ||
            updateConfig.isPending || executeBet.isPending ||
            startAuto.isPending || stopAuto.isPending,

        // Erreurs
        error: configQuery.error?.message ||
            matchesQuery.error?.message ||
            updateConfig.error?.message ||
            executeBet.error?.message ||
            startAuto.error?.message ||
            stopAuto.error?.message ||
            null,

        // Actions
        loadConfig: configQuery.refetch,
        loadMatches: matchesQuery.refetch,
        updateConfig: updateConfig.mutate,
        executeBet: (stake: number, acceptOddsChange: boolean = true) =>
            executeBet.mutate({ stake, acceptOddsChange }),
        startAutoExecution: startAuto.mutate,
        stopAutoExecution: stopAuto.mutate,

        // Utilitaires
        ...utils,
    };
}