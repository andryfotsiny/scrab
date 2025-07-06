// src/feature/football/hooks/useMini.ts
import { useState, useCallback } from 'react';
import { miniService } from '@/src/shared/services/api/football/mini.api';
import {
    MiniConfig,
    MiniMatchesResponse,
    MiniExecuteBetResponse,
    MiniAutoExecutionResponse,
    MiniConfigUpdateRequest
} from '@/src/features/football/types/mini';

export function useMini() {
    const [loading, setLoading] = useState(false);
    const [config, setConfig] = useState<MiniConfig | null>(null);
    const [matches, setMatches] = useState<MiniMatchesResponse | null>(null);
    const [miniAutoExecutionActive, setMiniAutoExecutionActive] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Charger la configuration
    const loadConfig = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const configData = await miniService.getConfig();
            setConfig(configData);
            return configData;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur de chargement de la configuration';
            setError(errorMessage);
            console.error('Load mini config error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Mettre à jour la configuration
    const updateConfig = useCallback(async (updates: MiniConfigUpdateRequest) => {
        try {
            console.log('🔄 Starting mini config update with:', updates);
            setLoading(true);
            setError(null);
            const response = await miniService.updateConfig(updates);
            console.log('✅ Mini config updated successfully:', response);

            // Corriger la configuration avec les valeurs envoyées si elles ne sont pas correctement retournées
            if (response.new_config) {
                const correctedConfig: MiniConfig = {
                    ...response.new_config,
                    metadata: response.metadata || response.new_config.metadata || undefined,
                    constraints: {
                        ...response.new_config.constraints,
                        // S'assurer que les valeurs envoyées sont utilisées si elles diffèrent
                        min_odds: updates.min_odds !== undefined ? updates.min_odds : response.new_config.constraints.min_odds,
                        max_odds: updates.max_odds !== undefined ? updates.max_odds : response.new_config.constraints.max_odds,
                        max_total_odds: updates.max_total_odds !== undefined ? updates.max_total_odds : response.new_config.constraints.max_total_odds,
                    },
                    settings: {
                        ...response.new_config.settings,
                        // S'assurer que la valeur envoyée est utilisée pour default_stake
                        default_stake: updates.default_stake !== undefined ? updates.default_stake : response.new_config.settings.default_stake,
                    }
                };

                console.log('🔧 Corrected config:', correctedConfig);
                setConfig(correctedConfig);
            }

            return response;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur de mise à jour de la configuration';
            setError(errorMessage);
            console.error('❌ Update mini config error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Charger les matchs
    const loadMatches = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const matchesData = await miniService.getMatches();
            setMatches(matchesData);
            return matchesData;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur de chargement des matchs';
            setError(errorMessage);
            console.error('Load mini matches error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Exécuter un pari
    const executeBet = useCallback(async (stake: number, acceptOddsChange: boolean = true) => {
        try {
            console.log('🔄 Starting mini bet execution with stake:', stake, 'acceptOddsChange:', acceptOddsChange);
            setLoading(true);
            setError(null);
            const response = await miniService.executeBet(stake, acceptOddsChange);
            console.log('✅ Mini bet executed successfully:', response);
            return response;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur d\'exécution du pari';
            setError(errorMessage);
            console.error('❌ Execute mini bet error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Démarrer l'exécution automatique
    const startAutoExecution = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await miniService.startAutoExecution();
            setMiniAutoExecutionActive(response.mini_auto_execution_active);
            return response;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur de démarrage de l\'exécution automatique';
            setError(errorMessage);
            console.error('Start mini auto execution error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Arrêter l'exécution automatique
    const stopAutoExecution = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await miniService.stopAutoExecution();
            setMiniAutoExecutionActive(response.mini_auto_execution_active);
            return response;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur d\'arrêt de l\'exécution automatique';
            setError(errorMessage);
            console.error('Stop mini auto execution error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        config,
        matches,
        miniAutoExecutionActive,
        error,
        loadConfig,
        updateConfig,
        loadMatches,
        executeBet,
        startAutoExecution,
        stopAutoExecution,
    };
}