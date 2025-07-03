// src/features/auth/types/index.ts
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
