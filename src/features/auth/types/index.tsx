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

export interface LoginRequest {
    bet_login: string;
    bet_password: string;
}

export interface LoginResponse {
    success: boolean;
    message: string;
    user_login: string;
    token: string;
    already_authenticated: boolean;
}

export interface LocalUserInfo {
    bet_login: number;
    status_payant: boolean;
    dure_gratuit: number;
    created_at: string;
    updated_at: string;
    is_authenticated: boolean;
    authentication_status: string;
}

export interface Bet261UserData {
    local_user: string;
    bet261_user_data: UserInfo;
}