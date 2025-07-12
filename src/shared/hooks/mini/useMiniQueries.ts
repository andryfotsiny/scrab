// src/shared/hooks/mini/useMiniQueries.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { miniService } from '@/src/shared/services/api/football/mini.api';
import {
    MiniConfig,
    MiniMatchesResponse,
    MiniExecuteBetResponse,
    MiniAutoExecutionResponse,
    MiniConfigUpdateRequest
} from '@/src/shared/services/types/mini.type';

// 🔑 Query Keys - Centralisés
export const miniKeys = {
    all: ['mini'] as const,
    config: () => [...miniKeys.all, 'config'] as const,
    matches: () => [...miniKeys.all, 'matches'] as const,
    autoExecution: () => [...miniKeys.all, 'autoExecution'] as const,
} as const;

// ⚙️ Hook: Mini Config
export function useMiniConfig() {
    return useQuery({
        queryKey: miniKeys.config(),
        queryFn: () => miniService.getConfig(),
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

// 🏆 Hook: Mini Matches (données publiques)
export function useMiniMatches() {
    return useQuery({
        queryKey: miniKeys.matches(),
        queryFn: () => miniService.getMatches(),
        staleTime: 30 * 1000,      // 30 secondes pour matchs
        gcTime: 5 * 60 * 1000,     // 5 minutes
        refetchInterval: 60 * 1000, // Auto-refresh toutes les minutes
        retry: (failureCount, error: any) => {
            // Pas besoin d'auth pour les matchs, retry plus agressif
            return failureCount < 3;
        },
    });
}

// 🔧 Hook: Update Mini Config
export function useUpdateMiniConfig() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (updates: MiniConfigUpdateRequest) => {
            console.log('🔧 Updating mini config:', updates);
            return miniService.updateConfig(updates);
        },
        onSuccess: (data, variables) => {
            console.log('✅ Mini config updated successfully:', data);

            // Mettre à jour le cache avec la nouvelle config
            if (data.new_config) {
                // Correction des données si nécessaire
                const correctedConfig: MiniConfig = {
                    ...data.new_config,
                    metadata: data.metadata || data.new_config.metadata,
                    constraints: {
                        ...data.new_config.constraints,
                        // S'assurer que les valeurs envoyées sont utilisées
                        min_odds: variables.min_odds !== undefined ? variables.min_odds : data.new_config.constraints.min_odds,
                        max_odds: variables.max_odds !== undefined ? variables.max_odds : data.new_config.constraints.max_odds,
                        max_total_odds: variables.max_total_odds !== undefined ? variables.max_total_odds : data.new_config.constraints.max_total_odds,
                    },
                    settings: {
                        ...data.new_config.settings,
                        default_stake: variables.default_stake !== undefined ? variables.default_stake : data.new_config.settings.default_stake,
                    }
                };

                queryClient.setQueryData(miniKeys.config(), correctedConfig);
            }

            // Invalider les matchs car la config peut affecter la sélection
            queryClient.invalidateQueries({ queryKey: miniKeys.matches() });
        },
        onError: (error) => {
            console.error('❌ Mini config update failed:', error);
        },
    });
}

// 🎯 Hook: Execute Mini Bet
export function useExecuteMiniBet() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ stake, acceptOddsChange = true }: { stake: number; acceptOddsChange?: boolean }) => {
            console.log('🎯 Executing mini bet:', { stake, acceptOddsChange });
            return miniService.executeBet(stake, acceptOddsChange);
        },
        onSuccess: (data) => {
            console.log('✅ Mini bet executed successfully:', data);

            // Invalider les matchs pour récupérer les nouveaux
            queryClient.invalidateQueries({ queryKey: miniKeys.matches() });

            // Optionnel: invalider les données utilisateur pour le nouveau solde
            queryClient.invalidateQueries({ queryKey: ['auth', 'bet261UserData'] });
        },
        onError: (error) => {
            console.error('❌ Mini bet execution failed:', error);
        },
    });
}

// 🔄 Hook: Start Auto Execution
export function useStartMiniAutoExecution() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => {
            console.log('🔄 Starting mini auto execution...');
            return miniService.startAutoExecution();
        },
        onSuccess: (data) => {
            console.log('✅ Mini auto execution started:', data);

            // Mettre à jour le statut dans le cache
            queryClient.setQueryData(miniKeys.autoExecution(), data);
        },
        onError: (error) => {
            console.error('❌ Start mini auto execution failed:', error);
        },
    });
}

// ⏹️ Hook: Stop Auto Execution
export function useStopMiniAutoExecution() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => {
            console.log('⏹️ Stopping mini auto execution...');
            return miniService.stopAutoExecution();
        },
        onSuccess: (data) => {
            console.log('✅ Mini auto execution stopped:', data);

            // Mettre à jour le statut dans le cache
            queryClient.setQueryData(miniKeys.autoExecution(), data);
        },
        onError: (error) => {
            console.error('❌ Stop mini auto execution failed:', error);
        },
    });
}

// 🛠️ Hook: Mini Utilities
export function useMiniUtils() {
    const queryClient = useQueryClient();

    return {
        // Invalider toutes les données mini
        invalidateAll: () => {
            queryClient.invalidateQueries({ queryKey: miniKeys.all });
        },

        // Invalider seulement la config
        invalidateConfig: () => {
            queryClient.invalidateQueries({ queryKey: miniKeys.config() });
        },

        // Invalider seulement les matchs
        invalidateMatches: () => {
            queryClient.invalidateQueries({ queryKey: miniKeys.matches() });
        },

        // Prefetch des données mini
        prefetchMiniData: () => {
            queryClient.prefetchQuery({
                queryKey: miniKeys.config(),
                queryFn: () => miniService.getConfig(),
            });

            queryClient.prefetchQuery({
                queryKey: miniKeys.matches(),
                queryFn: () => miniService.getMatches(),
            });
        },

        // Nettoyer le cache mini
        clearMiniCache: () => {
            queryClient.removeQueries({ queryKey: miniKeys.all });
        },

        // Vérifier si les données sont en cache
        hasMiniData: () => {
            const config = queryClient.getQueryData(miniKeys.config());
            const matches = queryClient.getQueryData(miniKeys.matches());
            return !!(config && matches);
        },

        // Forcer refresh des matchs
        refreshMatches: () => {
            return queryClient.refetchQueries({ queryKey: miniKeys.matches() });
        },

        // Forcer refresh de la config
        refreshConfig: () => {
            return queryClient.refetchQueries({ queryKey: miniKeys.config() });
        },
    };
}

// 🎯 Hook: Combined Mini Data (pour remplacer le contexte)
export function useMiniData() {
    const configQuery = useMiniConfig();
    const matchesQuery = useMiniMatches();
    const updateConfig = useUpdateMiniConfig();
    const executeBet = useExecuteMiniBet();
    const startAuto = useStartMiniAutoExecution();
    const stopAuto = useStopMiniAutoExecution();
    const utils = useMiniUtils();

    // État de l'auto-execution (peut être stocké dans le cache)
    const queryClient = useQueryClient();
    const autoExecutionData = queryClient.getQueryData(miniKeys.autoExecution()) as MiniAutoExecutionResponse | undefined;

    return {
        // Données
        config: configQuery.data,
        matches: matchesQuery.data,
        miniAutoExecutionActive: autoExecutionData?.mini_auto_execution_active ?? false,

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