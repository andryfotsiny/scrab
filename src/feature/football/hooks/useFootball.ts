// src/feature/football/hooks/useFootball.ts
import { useState, useCallback } from 'react';
import { footballService } from '@/src/shared/services/api/football/football.api';
import {
    FootballConfig,
    FootballMatchesResponse,
    ExecuteBetResponse,
    AutoExecutionResponse,
    ConfigUpdateRequest
} from '@/src/feature/football/types';

export function useFootball() {
    const [loading, setLoading] = useState(false);
    const [config, setConfig] = useState<FootballConfig | null>(null);
    const [matches, setMatches] = useState<FootballMatchesResponse | null>(null);
    const [autoExecutionActive, setAutoExecutionActive] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Charger la configuration
    const loadConfig = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const configData = await footballService.getConfig();
            setConfig(configData);
            return configData;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur de chargement de la configuration';
            setError(errorMessage);
            console.error('Load config error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Mettre à jour la configuration
    const updateConfig = useCallback(async (updates: ConfigUpdateRequest) => {
        try {
            console.log('🔄 Starting football config update with:', updates);
            setLoading(true);
            setError(null);
            const response = await footballService.updateConfig(updates);
            console.log('✅ Football config updated successfully:', response);
            setConfig(response.new_config);
            return response;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur de mise à jour de la configuration';
            setError(errorMessage);
            console.error('❌ Update football config error:', err);
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
            const matchesData = await footballService.getAllMatches();
            setMatches(matchesData);
            return matchesData;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur de chargement des matchs';
            setError(errorMessage);
            console.error('Load matches error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Exécuter un pari
    const executeBet = useCallback(async (stake: number, acceptOddsChange: boolean = true) => {
        try {
            console.log('🔄 Starting football bet execution with stake:', stake, 'acceptOddsChange:', acceptOddsChange);
            setLoading(true);
            setError(null);
            const response = await footballService.executeBet(stake, acceptOddsChange);
            console.log('✅ Football bet executed successfully:', response);
            return response;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur d\'exécution du pari';
            setError(errorMessage);
            console.error('❌ Execute football bet error:', err);
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
            const response = await footballService.startAutoExecution();
            setAutoExecutionActive(response.auto_execution_active);
            return response;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur de démarrage de l\'exécution automatique';
            setError(errorMessage);
            console.error('Start auto execution error:', err);
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
            const response = await footballService.stopAutoExecution();
            setAutoExecutionActive(response.auto_execution_active);
            return response;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur d\'arrêt de l\'exécution automatique';
            setError(errorMessage);
            console.error('Stop auto execution error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        config,
        matches,
        autoExecutionActive,
        error,
        loadConfig,
        updateConfig,
        loadMatches,
        executeBet,
        startAutoExecution,
        stopAutoExecution,
    };
}