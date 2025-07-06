// src/shared/services/api/football/football.api.ts
import { apiClient } from "@/src/shared/services/helpers/apiClient";
import {
    FootballConfig,
    FootballMatchesResponse,
    ExecuteBetResponse,
    AutoExecutionResponse,
    ConfigUpdateRequest
} from "@/src/features/football/types";

class FootballService {
    // API 1: Get Football Config
    async getConfig(): Promise<FootballConfig> {
        try {
            return await apiClient.get<FootballConfig>('/api/betting/football/config');
        } catch (error) {
            console.error('❌ Get football config error:', error);
            throw error;
        }
    }

    // API 2: Update Football Config
    async updateConfig(config: ConfigUpdateRequest): Promise<{
        message: string;
        changes_made: string[];
        new_config: FootballConfig;
        source: string;
        metadata: any;
    }> {
        try {
            console.log('📝 Updating football config with:', config);
            return await apiClient.put('/api/betting/football/config', undefined, config);
        } catch (error) {
            console.error('❌ Update football config error:', error);
            throw error;
        }
    }

    // API 3: Get All Football Matches
    async getAllMatches(): Promise<FootballMatchesResponse> {
        try {
            return await apiClient.get<FootballMatchesResponse>('/api/betting/football/matches');
        } catch (error) {
            console.error('❌ Get football matches error:', error);
            throw error;
        }
    }

    // API 4: Execute Football Bet
    async executeBet(stake: number, acceptOddsChange: boolean = true): Promise<ExecuteBetResponse> {
        try {
            const params = {
                stake,
                accept_odds_change: acceptOddsChange
            };
            console.log('🎯 Executing football bet with:', params);
            return await apiClient.post<ExecuteBetResponse>('/api/betting/football/execute', undefined, params);
        } catch (error) {
            console.error('❌ Execute football bet error:', error);
            throw error;
        }
    }

    // API 5: Start Auto Execution
    async startAutoExecution(): Promise<AutoExecutionResponse> {
        try {
            return await apiClient.post<AutoExecutionResponse>('/api/betting/football/auto-execution/start');
        } catch (error) {
            console.error('❌ Start auto execution error:', error);
            throw error;
        }
    }

    // API 6: Stop Auto Execution
    async stopAutoExecution(): Promise<AutoExecutionResponse> {
        try {
            return await apiClient.post<AutoExecutionResponse>('/api/betting/football/auto-execution/stop');
        } catch (error) {
            console.error('❌ Stop auto execution error:', error);
            throw error;
        }
    }
}

export const footballService = new FootballService();