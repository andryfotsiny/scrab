// src/features/football/context/MiniContext.tsx
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { miniService } from '@/src/shared/services/api/football/mini.api';
import { useAuth } from '@/src/shared/context/AuthContext';
import {
    MiniConfig,
    MiniMatchesResponse,
    MiniExecuteBetResponse,
    MiniAutoExecutionResponse,
    MiniConfigUpdateRequest
} from '@/src/features/football/types/mini';

interface MiniContextType {
    loading: boolean;
    config: MiniConfig | null;
    matches: MiniMatchesResponse | null;
    miniAutoExecutionActive: boolean;
    error: string | null;
    loadConfig: () => Promise<MiniConfig>;
    updateConfig: (updates: MiniConfigUpdateRequest) => Promise<{
        message: string;
        user: string;
        changes_made: string[];
        new_config: MiniConfig;
        system_type: string;
        source: string;
        metadata: any;
    }>;
    loadMatches: () => Promise<MiniMatchesResponse>;
    executeBet: (stake: number, acceptOddsChange?: boolean) => Promise<MiniExecuteBetResponse>;
    startAutoExecution: () => Promise<MiniAutoExecutionResponse>;
    stopAutoExecution: () => Promise<MiniAutoExecutionResponse>;
}

const MiniContext = createContext<MiniContextType | undefined>(undefined);

export function MiniProvider({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, bet261UserData } = useAuth();
    const [loading, setLoading] = useState(false);
    const [config, setConfig] = useState<MiniConfig | null>(null);
    const [matches, setMatches] = useState<MiniMatchesResponse | null>(null);
    const [miniAutoExecutionActive, setMiniAutoExecutionActive] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Check if user is authenticated for actions that require it
    const ensureAuthenticated = useCallback(() => {
        if (!isAuthenticated || !bet261UserData) {
            throw new Error('Vous devez être connecté pour effectuer cette action');
        }
    }, [isAuthenticated, bet261UserData]);

    // Charger la configuration (requires auth)
    const loadConfig = useCallback(async () => {
        try {
            ensureAuthenticated();
            setLoading(true);
            setError(null);
            console.log('🔄 MiniContext: Loading config...');

            const configData = await miniService.getConfig();
            console.log('✅ MiniContext: Config loaded:', configData);

            setConfig(configData);
            return configData;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur de chargement de la configuration';
            setError(errorMessage);
            console.error('❌ MiniContext: Load config error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [ensureAuthenticated]);

    // Mettre à jour la configuration (requires auth)
    const updateConfig = useCallback(async (updates: MiniConfigUpdateRequest) => {
        try {
            ensureAuthenticated();
            console.log('🔄 MiniContext: Starting config update with:', updates);
            setLoading(true);
            setError(null);

            const response = await miniService.updateConfig(updates);
            console.log('✅ MiniContext: Config updated successfully:', response);

            // Mettre à jour la configuration locale avec correction si nécessaire
            if (response.new_config) {
                const correctedConfig: MiniConfig = {
                    ...response.new_config,
                    metadata: response.metadata || response.new_config.metadata,
                    constraints: {
                        ...response.new_config.constraints,
                        // S'assurer que les valeurs envoyées sont utilisées
                        min_odds: updates.min_odds !== undefined ? updates.min_odds : response.new_config.constraints.min_odds,
                        max_odds: updates.max_odds !== undefined ? updates.max_odds : response.new_config.constraints.max_odds,
                        max_total_odds: updates.max_total_odds !== undefined ? updates.max_total_odds : response.new_config.constraints.max_total_odds,
                    },
                    settings: {
                        ...response.new_config.settings,
                        default_stake: updates.default_stake !== undefined ? updates.default_stake : response.new_config.settings.default_stake,
                    }
                };

                console.log('🔧 MiniContext: Corrected config:', correctedConfig);
                setConfig(correctedConfig);
            }

            return response;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur de mise à jour de la configuration';
            setError(errorMessage);
            console.error('❌ MiniContext: Update config error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [ensureAuthenticated]);

    // Charger les matchs (no auth required - shared data)
    const loadMatches = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('🔄 MiniContext: Loading matches...');

            const matchesData = await miniService.getMatches();
            console.log('✅ MiniContext: Matches loaded:', matchesData);

            setMatches(matchesData);
            return matchesData;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur de chargement des matchs';
            setError(errorMessage);
            console.error('❌ MiniContext: Load matches error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Exécuter un pari (requires auth)
    const executeBet = useCallback(async (stake: number, acceptOddsChange: boolean = true) => {
        try {
            ensureAuthenticated();
            console.log('🔄 MiniContext: Starting bet execution with stake:', stake, 'acceptOddsChange:', acceptOddsChange);
            setLoading(true);
            setError(null);

            const response = await miniService.executeBet(stake, acceptOddsChange);
            console.log('✅ MiniContext: Bet executed successfully:', response);

            return response;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur d\'exécution du pari';
            setError(errorMessage);
            console.error('❌ MiniContext: Execute bet error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [ensureAuthenticated]);

    // Démarrer l'exécution automatique (requires auth)
    const startAutoExecution = useCallback(async () => {
        try {
            ensureAuthenticated();
            setLoading(true);
            setError(null);
            console.log('🔄 MiniContext: Starting auto execution...');

            const response = await miniService.startAutoExecution();
            console.log('✅ MiniContext: Auto execution started:', response);

            setMiniAutoExecutionActive(response.mini_auto_execution_active);
            return response;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur de démarrage de l\'exécution automatique';
            setError(errorMessage);
            console.error('❌ MiniContext: Start auto execution error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [ensureAuthenticated]);

    // Arrêter l'exécution automatique (requires auth)
    const stopAutoExecution = useCallback(async () => {
        try {
            ensureAuthenticated();
            setLoading(true);
            setError(null);
            console.log('🔄 MiniContext: Stopping auto execution...');

            const response = await miniService.stopAutoExecution();
            console.log('✅ MiniContext: Auto execution stopped:', response);

            setMiniAutoExecutionActive(response.mini_auto_execution_active);
            return response;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur d\'arrêt de l\'exécution automatique';
            setError(errorMessage);
            console.error('❌ MiniContext: Stop auto execution error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [ensureAuthenticated]);

    // Clear mini data when user logs out
    useEffect(() => {
        if (!isAuthenticated) {
            console.log('🧹 MiniContext: User logged out, clearing mini data');
            setConfig(null);
            setMatches(null);
            setMiniAutoExecutionActive(false);
            setError(null);
        }
    }, [isAuthenticated]);

    // Debug effect
    useEffect(() => {
        console.log('🔍 MiniContext state changed:', {
            loading,
            hasConfig: !!config,
            hasMatches: !!matches,
            miniAutoExecutionActive,
            error,
            isAuthenticated,
            hasUserData: !!bet261UserData
        });
    }, [loading, config, matches, miniAutoExecutionActive, error, isAuthenticated, bet261UserData]);

    const value: MiniContextType = {
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

    return (
        <MiniContext.Provider value={value}>
            {children}
        </MiniContext.Provider>
    );
}

export function useMini(): MiniContextType {
    const context = useContext(MiniContext);
    if (context === undefined) {
        throw new Error('useMini must be used within a MiniProvider');
    }
    return context;
}