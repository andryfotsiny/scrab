// src/features/auth/types/index.ts - UPDATED avec rôles admin
import {Href} from "expo-router";

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
    force_new_login?: boolean;
}

export interface LoginResponse {
    success: boolean;
    message: string;
    user_login: string;
    token: string;
    expiry?: string;
    was_already_authenticated?: boolean;
    connection_type?: string;
    // 🆕 Nouvelles propriétés pour les rôles
    user_role: 'user' | 'admin' | 'super_admin';
    is_admin: boolean;
}

export interface LocalUserInfo {
    bet_login: number;
    status_payant: boolean;
    dure_gratuit: number;
    created_at: string;
    updated_at: string;
    is_authenticated: boolean;
    authentication_status: string;
    // 🆕 Informations de rôle ajoutées
    role_info: {
        role: 'user' | 'admin' | 'super_admin';
        is_admin: boolean;
        is_super_admin: boolean;
    };
}

export interface Bet261UserData {
    local_user: string;
    bet261_user_data: UserInfo;
}

// 🆕 Types pour la gestion des rôles dans AuthContext
export interface AuthUser {
    localUserInfo: LocalUserInfo | null;
    bet261UserData: Bet261UserData | null;
    currentUserLogin: string | null;
    role: 'user' | 'admin' | 'super_admin';
    isAdmin: boolean;
    isSuperAdmin: boolean;
}

// 🆕 Interface étendue pour AuthContext avec admin
export interface AuthContextType {
    // États de base
    loading: boolean;
    localUserInfo: LocalUserInfo | null;
    bet261UserData: Bet261UserData | null;
    isAuthenticated: boolean;
    error: string | null;
    currentUserLogin: string | null;

    // 🆕 Propriétés de rôle
    userRole: 'user' | 'admin' | 'super_admin';
    isAdmin: boolean;
    isSuperAdmin: boolean;

    // Actions de base
    login: (credentials: LoginRequest) => Promise<{
        success: boolean;
        error?: string;
        localUser?: LocalUserInfo;
        bet261User?: Bet261UserData;
        loginResponse?: LoginResponse;
    }>;
    logout: () => Promise<void>;
    refreshUserInfo: () => Promise<{
        localUser: LocalUserInfo;
        bet261User: Bet261UserData;
    }>;
    switchUser: (credentials: LoginRequest) => Promise<{
        success: boolean;
        error?: string;
        localUser?: LocalUserInfo;
        bet261User?: Bet261UserData;
        loginResponse?: LoginResponse;
    }>;

    // 🆕 Méthodes utilitaires pour les rôles
    hasAdminAccess: () => boolean;
    canAccessAdminPanel: () => boolean;
    getUserRole: () => 'user' | 'admin' | 'super_admin';
}

// 🆕 Types pour la protection des routes
export interface RouteProtectionProps {
    children: React.ReactNode;
    requireAdmin?: boolean;
    requireSuperAdmin?: boolean;
    fallback?: React.ReactNode;
    redirectTo?: Href;
}

// 🆕 Types pour les hooks de protection
export interface AuthGuardResult {
    isAllowed: boolean;
    isLoading: boolean;
    userRole: 'user' | 'admin' | 'super_admin';
    redirectPath?: string;
}

// Types pour les erreurs d'authentification
export interface AuthError {
    code: 'UNAUTHORIZED' | 'FORBIDDEN' | 'TOKEN_EXPIRED' | 'NETWORK_ERROR' | 'UNKNOWN';
    message: string;
    details?: any;
}