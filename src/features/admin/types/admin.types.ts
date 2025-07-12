// src/features/admin/types/admin.types.ts
export interface AdminUser {
    bet_login: string;
    granted_by: string | null;
    granted_at: string;
    notes: string | null;
    is_super_admin: boolean;
    role: 'admin' | 'super_admin';
    user_created_at: string;
}

export interface UserWithRole {
    bet_login: number;
    status_payant: boolean;
    dure_gratuit: number;
    created_at: string;
    updated_at: string;
    role: 'user' | 'admin' | 'super_admin';
    is_admin: boolean;
    is_super_admin: boolean;
}

export interface UserRole {
    user: string;
    role: 'user' | 'admin' | 'super_admin';
    is_admin: boolean;
    is_super_admin: boolean;
    permissions: string[];
}

export interface AdminListResponse {
    admins: AdminUser[];
    total_count: number;
    super_admins: number;
    regular_admins: number;
}

export interface UsersListResponse {
    total_users: number;
    users: UserWithRole[];
}

export interface PromoteRequest {
    bet_login: string;
    notes?: string;
}

export interface DemoteRequest {
    bet_login: string;
}

export interface PromoteResponse {
    message: string;
    promoted_user: string;
    granted_by: string;
    new_role: string;
}

export interface DemoteResponse {
    message: string;
    demoted_user: string;
    revoked_by: string;
    new_role: string;
}

export interface SystemStatus {
    system_status: string;
    total_registered_users: number;
    total_authenticated_users: number;
    total_admins: number;
    multi_user_system: boolean;
    admin_system: boolean;
}

export interface AuthenticatedUsersResponse {
    authenticated_users: string[];
    total_authenticated: number;
}

// Types pour les réponses API standardisées
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

// Types pour les modales et UI
export interface AdminAction {
    type: 'promote' | 'demote';
    user: UserWithRole;
    notes?: string;
}

export interface AdminModalData {
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
}

// Types pour les filtres et tri
export interface UserFilters {
    role?: 'all' | 'user' | 'admin' | 'super_admin';
    search?: string;
    authenticated?: boolean;
}

export interface UserSortConfig {
    field: 'bet_login' | 'created_at' | 'role' | 'status_payant';
    direction: 'asc' | 'desc';
}