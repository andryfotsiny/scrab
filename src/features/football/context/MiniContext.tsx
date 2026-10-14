// src/features/football/context/MiniContext.tsx - COMPLET avec corrections
import React, { createContext, useContext, useCallback, useEffect } from 'react';
import { useAuth } from '@/src/shared/context/AuthContext';
import {
    MiniConfig,
    MiniMatchesResponse,
    MiniExecuteBetResponse,
    MiniAutoExecutionResponse,
    MiniConfigUpdateRequest
} from '@/src/shared/services/types/mini.type';
import {
    useMiniData,
    useUpdateMiniConfig,
    useExecuteMiniBet,
    useStartMiniAutoExecution,
    useStopMiniAutoExecution,
    useMiniUtils
} from '@/src/shared/hooks/mini/useMiniQueries';

interface MiniContextType {
    // ✅ États simplifiés - React Query gère le cache
    loading: boolean;
    config: MiniConfig | null;
    matches: MiniMatchesResponse | null;
    miniAutoExecutionActive: boolean;
    error: string | null;

    // ✅ Actions - utilise React Query hooks
    loadConfig: () => Promise<any>;
    updateConfig: (updates: MiniConfigUpdateRequest) => Promise<{
        message: string;
        user: string;
        changes_made: string[];
        new_config: MiniConfig;
        system_type: string;
        source: string;
        metadata: any;
    }>;
    loadMatches: () => Promise<any>;
    executeBet: (stake: number, acceptOddsChange?: boolean) => Promise<MiniExecuteBetResponse>;
    startAutoExecution: () => Promise<MiniAutoExecutionResponse>;
    stopAutoExecution: () => Promise<MiniAutoExecutionResponse>;
}

const MiniContext = createContext<MiniContextType | undefined>(undefined);

export function MiniProvider({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, bet261UserData } = useAuth();

    // ✅ React Query hooks - remplace la logique du contexte
    const miniData = useMiniData();
    const updateConfigMutation = useUpdateMiniConfig();
    const executeBetMutation = useExecuteMiniBet();
    const startAutoMutation = useStartMiniAutoExecution();
    const stopAutoMutation = useStopMiniAutoExecution();
    const miniUtils = useMiniUtils();

    // ✅ Check if user is authenticated for actions that require it
    const ensureAuthenticated = useCallback(() => {
        if (!isAuthenticated || !bet261UserData) {
            throw new Error('Vous devez être connecté pour effectuer cette action');
        }
    }, [isAuthenticated, bet261UserData]);

    // ✅ Wrapper actions avec vérification d'authentification
    const loadConfig = useCallback(async () => {
        ensureAuthenticated();
        return await miniData.loadConfig();
    }, [ensureAuthenticated, miniData.loadConfig]);

    // 🔧 CORRECTION: Typer explicitement le retour de updateConfig
    const updateConfig = useCallback(async (updates: MiniConfigUpdateRequest): Promise<{
        message: string;
        user: string;
        changes_made: string[];
        new_config: MiniConfig;
        system_type: string;
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
        return await miniData.loadMatches();
    }, [miniData.loadMatches]);

    // 🔧 CORRECTION: Typer explicitement le retour de executeBet
    const executeBet = useCallback(async (stake: number, acceptOddsChange: boolean = true): Promise<MiniExecuteBetResponse> => {
        ensureAuthenticated();

        return new Promise<MiniExecuteBetResponse>((resolve, reject) => {
            executeBetMutation.mutate({ stake, acceptOddsChange }, {
                onSuccess: (data) => resolve(data),
                onError: (error) => reject(error),
            });
        });
    }, [ensureAuthenticated, executeBetMutation.mutate]);

    // 🔧 CORRECTION: Typer explicitement le retour de startAutoExecution
    const startAutoExecution = useCallback(async (): Promise<MiniAutoExecutionResponse> => {
        ensureAuthenticated();

        return new Promise<MiniAutoExecutionResponse>((resolve, reject) => {
            startAutoMutation.mutate(undefined, {
                onSuccess: (data) => resolve(data),
                onError: (error) => reject(error),
            });
        });
    }, [ensureAuthenticated, startAutoMutation.mutate]);

    // 🔧 CORRECTION: Typer explicitement le retour de stopAutoExecution
    const stopAutoExecution = useCallback(async (): Promise<MiniAutoExecutionResponse> => {
        ensureAuthenticated();

        return new Promise<MiniAutoExecutionResponse>((resolve, reject) => {
            stopAutoMutation.mutate(undefined, {
                onSuccess: (data) => resolve(data),
                onError: (error) => reject(error),
            });
        });
    }, [ensureAuthenticated, stopAutoMutation.mutate]);

    // ✅ Clear mini data when user logs out
    useEffect(() => {
        if (!isAuthenticated) {
            // React Query gère automatiquement le cache selon la configuration
        }
    }, [isAuthenticated]);

    // ✅ Debug effect - réduit pour éviter le spam
    useEffect(() => {
    }, [
        miniData.loading, miniData.config, miniData.matches,
        miniData.miniAutoExecutionActive, miniData.error,
        isAuthenticated, bet261UserData
    ]);

    const value: MiniContextType = {
        // 🔧 CORRECTION: Convertir undefined en null pour correspondre à l'interface
        loading: miniData.loading,
        config: miniData.config || null,
        matches: miniData.matches || null,
        miniAutoExecutionActive: miniData.miniAutoExecutionActive,
        error: miniData.error,

        // ✅ Actions wrappées avec types corrects
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