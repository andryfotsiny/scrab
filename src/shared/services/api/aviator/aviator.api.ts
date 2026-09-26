// src/shared/services/api/aviator/aviator.api.ts
import { apiClient } from "@/src/shared/services/helpers/apiClient";
import {
    AviatorStartResponse,
    AviatorStopResponse,
    AviatorStatusResponse,
} from "@/src/shared/services/types/aviator.type";

class AviatorService {
    // Démarre le bot : place la mise et arme l'encaissement automatique au multiplicateur cible
    async start(stake: number, cashoutMultiplier: number): Promise<AviatorStartResponse> {
        try {
            const params = {
                stake,
                cashout_multiplier: cashoutMultiplier,
            };
            console.log('✈️ Starting Aviator bot with:', params);
            return await apiClient.post<AviatorStartResponse>('/api/aviator/start', undefined, params);
        } catch (error) {
            console.error('❌ Start Aviator bot error:', error);
            throw error;
        }
    }

    // Arrête le bot pour l'utilisateur connecté
    async stop(): Promise<AviatorStopResponse> {
        try {
            return await apiClient.post<AviatorStopResponse>('/api/aviator/stop');
        } catch (error) {
            console.error('❌ Stop Aviator bot error:', error);
            throw error;
        }
    }

    // Statut courant du bot (actif ou non) pour l'utilisateur connecté
    async getStatus(): Promise<AviatorStatusResponse> {
        try {
            return await apiClient.get<AviatorStatusResponse>('/api/aviator/status');
        } catch (error) {
            console.error('❌ Get Aviator status error:', error);
            throw error;
        }
    }
}

export const aviatorService = new AviatorService();
