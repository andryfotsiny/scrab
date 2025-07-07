// src/shared/services/api/football/mini.api.ts (Updated with AuthContext)
import { apiClient } from "@/src/shared/services/helpers/apiClient";
import {
    MiniConfig,
    MiniMatchesResponse,
    MiniExecuteBetResponse,
    MiniAutoExecutionResponse,
    MiniConfigUpdateRequest
} from "@/src/shared/services/types/mini.type";

class MiniService {
    // MINI API 1: Get Mini Config (requires authentication)
    async getConfig(): Promise<MiniConfig> {
        try {
            return await apiClient.get<MiniConfig>('/api/betting/mini/config');
        } catch (error) {
            console.error('❌ Get mini config error:', error);
            throw error;
        }
    }

    // MINI API 2: Update Mini Config (requires authentication)
    async updateConfig(config: MiniConfigUpdateRequest): Promise<{
        message: string;
        user: string;
        changes_made: string[];
        new_config: MiniConfig;
        system_type: string;
        source: string;
        metadata: any;
    }> {
        try {
            console.log('📝 Updating mini config with:', config);
            return await apiClient.put('/api/betting/mini/config', undefined, config);
        } catch (error) {
            console.error('❌ Update mini config error:', error);
            throw error;
        }
    }

    // MINI API 3: Get Two Matches Preview (no authentication required - shared data)
    async getMatches(): Promise<MiniMatchesResponse> {
        try {
            return await apiClient.get<MiniMatchesResponse>('/api/betting/mini/matches');
        } catch (error) {
            console.error('❌ Get mini matches error:', error);
            throw error;
        }
    }

    // MINI API 4: Execute Mini Bet (requires authentication)
    async executeBet(stake: number, acceptOddsChange: boolean = true): Promise<MiniExecuteBetResponse> {
        try {
            const params = {
                stake,
                accept_odds_change: acceptOddsChange
            };
            console.log('🎯 Executing mini bet with:', params);
            return await apiClient.post<MiniExecuteBetResponse>('/api/betting/mini/execute', undefined, params);
        } catch (error) {
            console.error('❌ Execute mini bet error:', error);
            throw error;
        }
    }

    // MINI API 5: Start Mini Auto Execution (requires authentication)
    async startAutoExecution(): Promise<MiniAutoExecutionResponse> {
        try {
            return await apiClient.post<MiniAutoExecutionResponse>('/api/betting/mini/auto-execution/start');
        } catch (error) {
            console.error('❌ Start mini auto execution error:', error);
            throw error;
        }
    }

    // MINI API 6: Stop Mini Auto Execution (requires authentication)
    async stopAutoExecution(): Promise<MiniAutoExecutionResponse> {
        try {
            return await apiClient.post<MiniAutoExecutionResponse>('/api/betting/mini/auto-execution/stop');
        } catch (error) {
            console.error('❌ Stop mini auto execution error:', error);
            throw error;
        }
    }
}

export const miniService = new MiniService();