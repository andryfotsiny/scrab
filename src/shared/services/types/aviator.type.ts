// src/shared/services/types/aviator.type.ts

export interface AviatorStartResponse {
    success: boolean;
    message: string;
    user_login: string;
    stake: number;
    cashout_multiplier: number;
}

export interface AviatorStopResponse {
    success: boolean;
    message: string;
    user_login: string;
}

export interface AviatorStatusResponse {
    active: boolean;
    user_login: string;
    stake?: number;
    cashout_multiplier?: number;
}
