// src/shared/services/api/football/football.api.ts (Updated with AuthContext)
import { apiClient } from "@/src/shared/services/helpers/apiClient";
import {
    FootballConfig,
    FootballMatchesResponse,
    ExecuteBetResponse,
    AutoExecutionResponse,
    ConfigUpdateRequest,
    GlobalConfigResponse,
    GlobalConfigUpdateRequest
} from "@/src/shared/services/types/grolo.type";

class FootballService {
    // API 1: Get Football Config (requires authentication)
    async getConfig(): Promise<FootballConfig> {
        try {
            return await apiClient.get<FootballConfig>('/api/betting/football/config');
        } catch (error) {
            console.error('Get football config error:', error);
            throw error;
        }
    }

    // API 2: Update Football Config (requires authentication)
    async updateConfig(config: ConfigUpdateRequest): Promise<{
        message: string;
        user: string;
        changes_made: string[];
        new_config: FootballConfig;
        source: string;
        metadata: any;
    }> {
        try {
            return await apiClient.put('/api/betting/football/config', undefined, config);
        } catch (error) {
            console.error('Update football config error:', error);
            throw error;
        }
    }

    // Réglages communs à tous les utilisateurs (admin seulement)
    async getGlobalConfig(): Promise<GlobalConfigResponse> {
        return await apiClient.get<GlobalConfigResponse>('/api/betting/football/config/global');
    }

    async updateGlobalConfig(config: GlobalConfigUpdateRequest): Promise<{
        message: string;
        changes_made: string[];
        constraints: GlobalConfigResponse['constraints'];
        metadata: GlobalConfigResponse['metadata'];
    }> {
        return await apiClient.put('/api/betting/football/config/global', undefined, config);
    }

    // Remet les réglages communs aux valeurs par défaut (admin seulement) ; les mises personnelles ne bougent pas
    async resetGlobalConfig(): Promise<{
        message: string;
        changes_made: string[];
        constraints: GlobalConfigResponse['constraints'];
        metadata: GlobalConfigResponse['metadata'];
    }> {
        return await apiClient.post('/api/betting/football/config/global/reset');
    }

    // API 3: Get All Football Matches (no authentication required - shared data)
    async getAllMatches(): Promise<FootballMatchesResponse> {
        try {
            return await apiClient.get<FootballMatchesResponse>('/api/betting/football/matches');
        } catch (error) {
            console.error('Get football matches error:', error);
            throw error;
        }
    }

    // API 4: Execute Football Bet (requires authentication)
    async executeBet(stake: number, acceptOddsChange: boolean = true): Promise<ExecuteBetResponse> {
        try {
            const params = {
                stake,
                accept_odds_change: acceptOddsChange
            };
            return await apiClient.post<ExecuteBetResponse>('/api/betting/football/execute', undefined, params);
        } catch (error) {
            console.error('Execute football bet error:', error);
            throw error;
        }
    }

    // API 5: Start Auto Execution (requires authentication)
    // intervalHours : répète le pari toutes les N heures au lieu de 00h00 Madagascar (mode « Grolo Turbo »)
    async startAutoExecution(intervalHours?: number): Promise<AutoExecutionResponse> {
        try {
            const params = intervalHours ? { interval_hours: intervalHours } : undefined;
            return await apiClient.post<AutoExecutionResponse>('/api/betting/football/auto-execution/start', undefined, params);
        } catch (error) {
            console.error('Start auto execution error:', error);
            throw error;
        }
    }

    // API 6: Stop Auto Execution (requires authentication)
    async stopAutoExecution(): Promise<AutoExecutionResponse> {
        try {
            return await apiClient.post<AutoExecutionResponse>('/api/betting/football/auto-execution/stop');
        } catch (error) {
            console.error('Stop auto execution error:', error);
            throw error;
        }
    }
}

export const footballService = new FootballService();