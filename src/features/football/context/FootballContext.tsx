// src/features/football/context/FootballContext.tsx - VERSION SANS BOUCLE
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { footballService } from '@/src/shared/services/api/football/football.api';
import { useAuth } from '@/src/shared/context/AuthContext';
import {
    FootballConfig,
    FootballMatchesResponse,
    ExecuteBetResponse,
    AutoExecutionResponse,
    ConfigUpdateRequest
} from '../../../shared/services/types';

interface FootballContextType {
    loading: boolean;
    config: FootballConfig | null;
    matches: FootballMatchesResponse | null;
    autoExecutionActive: boolean;
    error: string | null;
    loadConfig: () => Promise<FootballConfig>;
    updateConfig: (updates: ConfigUpdateRequest) => Promise<{
        message: string;
        user: string;
        changes_made: string[];
        new_config: FootballConfig;
        source: string;
        metadata: any;
    }>;
    loadMatches: () => Promise<FootballMatchesResponse>;
    executeBet: (stake: number, acceptOddsChange?: boolean) => Promise<ExecuteBetResponse>;
    startAutoExecution: () => Promise<AutoExecutionResponse>;
    stopAutoExecution: () => Promise<AutoExecutionResponse>;
}

const FootballContext = createContext<FootballContextType | undefined>(undefined);

export function FootballProvider({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, bet261UserData } = useAuth();
    const [loading, setLoading] = useState(false);
    const [config, setConfig] = useState<FootballConfig | null>(null);
    const [matches, setMatches] = useState<FootballMatchesResponse | null>(null);
    const [autoExecutionActive, setAutoExecutionActive] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Check if user is authenticated for actions that require it
    const ensureAuthenticated = useCallback(() => {
        if (!isAuthenticated || !bet261UserData) {
            throw new Error('Vous devez être connecté pour effectuer cette action');
        }
    }, [isAuthenticated, bet261UserData]);

    // ✅ SOLUTION SIMPLE: Supprimer executeWithSessionCheck et laisser apiClient gérer
    // L'apiClient enhanced gère déjà automatiquement le refresh, pas besoin de double logique

    // ✅ Charger la configuration (version simplifiée)
    const loadConfig = useCallback(async () => {
        try {
            ensureAuthenticated();
            setLoading(true);
            setError(null);
            console.log('🔄 FootballContext: Loading config...');

            // ✅ Appel direct - l'apiClient gère automatiquement le refresh
            const configData = await footballService.getConfig();
            console.log('✅ FootballContext: Config loaded:', configData);

            setConfig(configData);
            return configData;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur de chargement de la configuration';
            setError(errorMessage);
            console.error('❌ FootballContext: Load config error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [ensureAuthenticated]); // ✅ Dépendances correctes

    // ✅ Mettre à jour la configuration (version simplifiée)
    const updateConfig = useCallback(async (updates: ConfigUpdateRequest) => {
        try {
            ensureAuthenticated();
            console.log('🔄 FootballContext: Starting config update with:', updates);
            setLoading(true);
            setError(null);

            // ✅ Appel direct - l'apiClient gère automatiquement le refresh
            const response = await footballService.updateConfig(updates);
            console.log('✅ FootballContext: Config updated successfully:', response);

            // Mettre à jour la configuration locale avec les nouvelles données
            if (response.new_config) {
                const updatedConfig = {
                    ...response.new_config,
                    metadata: response.metadata || response.new_config.metadata
                };
                setConfig(updatedConfig);
            }

            return response;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur de mise à jour de la configuration';
            setError(errorMessage);
            console.error('❌ FootballContext: Update config error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [ensureAuthenticated]);

    // ✅ Charger les matchs (no auth required - shared data)
    const loadMatches = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('🔄 FootballContext: Loading matches...');

            const matchesData = await footballService.getAllMatches();
            console.log('✅ FootballContext: Matches loaded:', matchesData);

            setMatches(matchesData);
            return matchesData;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur de chargement des matchs';
            setError(errorMessage);
            console.error('❌ FootballContext: Load matches error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // ✅ Exécuter un pari (version simplifiée)
    const executeBet = useCallback(async (stake: number, acceptOddsChange: boolean = true) => {
        try {
            ensureAuthenticated();
            console.log('🔄 FootballContext: Starting bet execution with stake:', stake, 'acceptOddsChange:', acceptOddsChange);
            setLoading(true);
            setError(null);

            // ✅ Appel direct - l'apiClient gère automatiquement le refresh
            const response = await footballService.executeBet(stake, acceptOddsChange);
            console.log('✅ FootballContext: Bet executed successfully:', response);

            return response;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur d\'exécution du pari';
            setError(errorMessage);
            console.error('❌ FootballContext: Execute bet error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [ensureAuthenticated]);

    // ✅ Démarrer l'exécution automatique (version simplifiée)
    const startAutoExecution = useCallback(async () => {
        try {
            ensureAuthenticated();
            setLoading(true);
            setError(null);
            console.log('🔄 FootballContext: Starting auto execution...');

            // ✅ Appel direct - l'apiClient gère automatiquement le refresh
            const response = await footballService.startAutoExecution();
            console.log('✅ FootballContext: Auto execution started:', response);

            setAutoExecutionActive(response.auto_execution_active);
            return response;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur de démarrage de l\'exécution automatique';
            setError(errorMessage);
            console.error('❌ FootballContext: Start auto execution error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [ensureAuthenticated]);

    // ✅ Arrêter l'exécution automatique (version simplifiée)
    const stopAutoExecution = useCallback(async () => {
        try {
            ensureAuthenticated();
            setLoading(true);
            setError(null);
            console.log('🔄 FootballContext: Stopping auto execution...');

            // ✅ Appel direct - l'apiClient gère automatiquement le refresh
            const response = await footballService.stopAutoExecution();
            console.log('✅ FootballContext: Auto execution stopped:', response);

            setAutoExecutionActive(response.auto_execution_active);
            return response;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur d\'arrêt de l\'exécution automatique';
            setError(errorMessage);
            console.error('❌ FootballContext: Stop auto execution error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [ensureAuthenticated]);

    // Clear football data when user logs out
    useEffect(() => {
        if (!isAuthenticated) {
            console.log('🧹 FootballContext: User logged out, clearing football data');
            setConfig(null);
            setMatches(null);
            setAutoExecutionActive(false);
            setError(null);
        }
    }, [isAuthenticated]);

    // ✅ SUPPRIMÉ: sessionManager et useSessionManager pour éviter la boucle
    // L'apiClient enhanced gère déjà tout automatiquement

    // Debug effect - réduit pour éviter le spam
    useEffect(() => {
        console.log('🔍 FootballContext state changed:', {
            loading,
            hasConfig: !!config,
            hasMatches: !!matches,
            autoExecutionActive,
            error,
            isAuthenticated,
            hasUserData: !!bet261UserData
        });
    }, [loading, config, matches, autoExecutionActive, error, isAuthenticated, bet261UserData]);

    const value: FootballContextType = {
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

    return (
        <FootballContext.Provider value={value}>
            {children}
        </FootballContext.Provider>
    );
}

export function useFootball(): FootballContextType {
    const context = useContext(FootballContext);
    if (context === undefined) {
        throw new Error('useFootball must be used within a FootballProvider');
    }
    return context;
}