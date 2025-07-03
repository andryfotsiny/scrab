// src/shared/services/api/auth/auth.api.ts
import { apiClient } from "@/src/shared/services/helpers/apiClient";

export interface UserInfo {
    id: number;
    login: string;
    state: number;
    balance: number;
    freeBalance: number;
    loyaltyBalance: number;
    hasAcceptedGcu: boolean;
    referrerActive: boolean;
    customerPaymentAccounts: any[];
    superReferrerState: string;
    superReferrerActive: boolean;
    depositsAllowed: boolean;
    withdrawalsAllowed: boolean;
    profile: {
        documents: any[];
    };
    isLocked: boolean;
    mustChangePassword: boolean;
    reference: string;
}

export interface LoginResponse {
    message: string;
}

class AuthService {
    async login(): Promise<LoginResponse> {
        try {
            return await apiClient.get<LoginResponse>('/api/login');
        } catch (error) {
            console.error('❌ Login error:', error);
            throw error;
        }
    }

    async getUserInfo(): Promise<UserInfo> {
        try {
            return await apiClient.get<UserInfo>('/api/user-info');
        } catch (error) {
            console.error('❌ Get user info error:', error);
            throw error;
        }
    }
}

export const authService = new AuthService();