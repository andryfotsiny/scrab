// src/features/football/context/FootballContext.tsx - COMPLET avec corrections
import React, { createContext, useContext, useCallback, useEffect } from 'react';
import { useAuth } from '@/src/shared/context/AuthContext';
import {
    FootballConfig,
    FootballMatchesResponse,
    ExecuteBetResponse,
    AutoExecutionResponse,
    ConfigUpdateRequest
} from '../../../shared/services/types/grolo.type';
import {
    useGroloData,
    useUpdateGroloConfig,
    useExecuteGroloBet,
    useStartGroloAutoExecution,
    useStopGroloAutoExecution,
    useGroloUtils
} from '@/src/shared/hooks/grolo/useGroloQueries';

interface FootballContextType {
    // États simplifiés - React Query gère le cache
    loading: boolean;
    config: FootballConfig | null;
    matches: FootballMatchesResponse | null;
    autoExecutionActive: boolean;
    /** Intervalle en heures si l'auto-exécution tourne en mode « Grolo Turbo », null en mode 00h00 classique */
    autoExecutionIntervalHours: number | null;
    error: string | null;

    // Actions - utilise React Query hooks
    loadConfig: () => Promise<any>;
    updateConfig: (updates: ConfigUpdateRequest) => Promise<{
        message: string;
        user: string;
        changes_made: string[];
        new_config: FootballConfig;
        source: string;
        metadata: any;
    }>;
    loadMatches: () => Promise<any>;
    executeBet: (stake: number, acceptOddsChange?: boolean) => Promise<ExecuteBetResponse>;
    startAutoExecution: (intervalHours?: number) => Promise<AutoExecutionResponse>;
    stopAutoExecution: () => Promise<AutoExecutionResponse>;
}

const FootballContext = createContext<FootballContextType | undefined>(undefined);

export function FootballProvider({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, bet261UserData } = useAuth();

    // React Query hooks - remplace la logique du contexte
    const groloData = useGroloData();
    const updateConfigMutation = useUpdateGroloConfig();
    const executeBetMutation = useExecuteGroloBet();
    const startAutoMutation = useStartGroloAutoExecution();
    const stopAutoMutation = useStopGroloAutoExecution();
    const groloUtils = useGroloUtils();

    // Check if user is authenticated for actions that require it
    const ensureAuthenticated = useCallback(() => {
        if (!isAuthenticated || !bet261UserData) {
            throw new Error('Vous devez être connecté pour effectuer cette action');
        }
    }, [isAuthenticated, bet261UserData]);

    // Wrapper actions avec vérification d'authentification
    const loadConfig = useCallback(async () => {
        ensureAuthenticated();
        return await groloData.loadConfig();
    }, [ensureAuthenticated, groloData.loadConfig]);

    // 🔧 CORRECTION: Typer explicitement le retour de updateConfig
    const updateConfig = useCallback(async (updates: ConfigUpdateRequest): Promise<{
        message: string;
        user: string;
        changes_made: string[];
        new_config: FootballConfig;
        source: string;
        metadata: any;
    }> => {
        ensureAuthenticated();

        return new Promise((resolve, reject) => {
            updateConfigMutation.mutate(updates, {
                onSuccess: (data) => resolve(data),
                onError: (error) => reject(error),
            });
        });
    }, [ensureAuthenticated, updateConfigMutation.mutate]);

    const loadMatches = useCallback(async () => {
        return await groloData.loadMatches();
    }, [groloData.loadMatches]);

    // 🔧 CORRECTION: Typer explicitement le retour de executeBet
    const executeBet = useCallback(async (stake: number, acceptOddsChange: boolean = true): Promise<ExecuteBetResponse> => {
        ensureAuthenticated();

        return new Promise<ExecuteBetResponse>((resolve, reject) => {
            executeBetMutation.mutate({ stake, acceptOddsChange }, {
                onSuccess: (data) => resolve(data),
                onError: (error) => reject(error),
            });
        });
    }, [ensureAuthenticated, executeBetMutation.mutate]);

    // 🔧 CORRECTION: Typer explicitement le retour de startAutoExecution
    const startAutoExecution = useCallback(async (intervalHours?: number): Promise<AutoExecutionResponse> => {
        ensureAuthenticated();

        return new Promise<AutoExecutionResponse>((resolve, reject) => {
            startAutoMutation.mutate(intervalHours, {
                onSuccess: (data) => resolve(data),
                onError: (error) => reject(error),
            });
        });
    }, [ensureAuthenticated, startAutoMutation.mutate]);

    // 🔧 CORRECTION: Typer explicitement le retour de stopAutoExecution
    const stopAutoExecution = useCallback(async (): Promise<AutoExecutionResponse> => {
        ensureAuthenticated();

        return new Promise<AutoExecutionResponse>((resolve, reject) => {
            stopAutoMutation.mutate(undefined, {
                onSuccess: (data) => resolve(data),
                onError: (error) => reject(error),
            });
        });
    }, [ensureAuthenticated, stopAutoMutation.mutate]);

    // Clear grolo data when user logs out
    useEffect(() => {
        if (!isAuthenticated) {
            // React Query gère automatiquement le cache selon la configuration
        }
    }, [isAuthenticated]);

    // Debug effect - réduit pour éviter le spam
    useEffect(() => {
    }, [
        groloData.loading, groloData.config, groloData.matches,
        groloData.autoExecutionActive, groloData.error,
        isAuthenticated, bet261UserData
    ]);

    const value: FootballContextType = {
        // États depuis React Query
        loading: groloData.loading,
        config: groloData.config || null,
        matches: groloData.matches || null,
        autoExecutionActive: groloData.autoExecutionActive,
        autoExecutionIntervalHours: groloData.autoExecutionIntervalHours,
        error: groloData.error,

        // Actions wrappées
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