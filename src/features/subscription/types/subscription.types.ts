// src/features/subscription/types/subscription.types.ts

// ===================================================================
// TYPES DE BASE POUR LES ABONNEMENTS
// ===================================================================

export type AccountType = 'gratuit' | 'payant';
export type AccessLevel = 'complet' | 'limite';
export type TrialStatus = 'non_demarre' | 'actif' | 'expire' | 'non_applicable';

export interface SubscriptionStatus {
    user: string;
    account_type: AccountType;
    status_payant: boolean;
    access_level: AccessLevel;
    trial_status: TrialStatus;
    days_remaining: number | null;
    created_at: string;
    can_use_premium_features: boolean;
}

// ===================================================================
// TYPES POUR LES ACTIONS D'ADMINISTRATION
// ===================================================================

export interface SubscriptionActionRequest {
    bet_login: string;
    notes?: string;
}

export interface ExtendTrialRequest extends SubscriptionActionRequest {
    additional_days: number;
}

export interface SubscriptionActionResult {
    success: boolean;
    message?: string;
    data?: {
        user: string;
        activated_by?: string;
        deactivated_by?: string;
        extended_by?: string;
        notes?: string;
        additional_days?: number;
        previous_status?: SubscriptionStatus;
        new_status?: SubscriptionStatus;
        previous_days?: number;
        new_days?: number;
    };
    error?: string;
}

// ===================================================================
// TYPES POUR LES STATISTIQUES
// ===================================================================

export interface SubscriptionStatistics {
    total_users: number;
    paid_users: number;
    free_users: number;
    trial_active: number;
    trial_expired: number;
    trial_not_started: number;
    conversion_rate: number;
}

export interface FormattedSubscriptionStatistics {
    totalUsers: number;
    paidUsers: number;
    freeUsers: number;
    trialActive: number;
    trialExpired: number;
    trialNotStarted: number;
    conversionRate: string;
    paidPercentage: string;
    freePercentage: string;
}

export interface AllUsersSubscriptionData {
    users: SubscriptionStatus[];
    statistics: SubscriptionStatistics;
}

// ===================================================================
// TYPES POUR L'AFFICHAGE ET L'INTERFACE
// ===================================================================

export interface SubscriptionDisplayInfo {
    label: string;
    color: string;
    description: string;
    icon: string;
    badgeVariant: 'success' | 'warning' | 'error' | 'info';
}

export interface SubscriptionActions {
    canActivatePaid: boolean;
    canDeactivatePaid: boolean;
    canExtendTrial: boolean;
    canViewDetails: boolean;
}

// ===================================================================
// TYPES POUR LES MODALES ET NOTIFICATIONS
// ===================================================================

export interface SubscriptionModalConfig {
    type: 'activate' | 'deactivate' | 'extend';
    title: string;
    message: string;
    confirmText: string;
    user: {
        bet_login: string;
        current_status: SubscriptionStatus;
    };
    action: () => Promise<void>;
}

export interface SubscriptionNotification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    duration?: number;
    action?: {
        label: string;
        onPress: () => void;
    };
}

// ===================================================================
// TYPES POUR LES FORMULAIRES
// ===================================================================

export interface ExtendTrialFormData {
    additional_days: number;
    notes: string;
}

export interface ActivateAccountFormData {
    notes: string;
}

export interface SubscriptionFormErrors {
    additional_days?: string;
    notes?: string;
    general?: string;
}

// ===================================================================
// TYPES ÉTENDUS POUR L'INTÉGRATION AVEC LES UTILISATEURS
// ===================================================================

export interface UserWithSubscription {
    bet_login: number | string;
    role: 'user' | 'admin' | 'super_admin';
    is_admin: boolean;
    is_super_admin: boolean;
    created_at: string;
    status_payant: boolean;
    dure_gratuit: number;
    subscription_status?: SubscriptionStatus;
    subscription_display?: SubscriptionDisplayInfo;
    subscription_actions?: SubscriptionActions;
}

// ===================================================================
// TYPES POUR LES RÉPONSES API
// ===================================================================

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export type SubscriptionStatusResponse = ApiResponse<SubscriptionStatus>;
export type AllUsersSubscriptionResponse = ApiResponse<AllUsersSubscriptionData>;
export type SubscriptionActionResponse = ApiResponse<SubscriptionActionResult['data']>;

// ===================================================================
// TYPES POUR LA CONFIGURATION DU SYSTÈME
// ===================================================================

export interface SubscriptionSystemConfig {
    trial_period_days: number;
    trial_description: string;
    premium_features: string[];
    how_to_upgrade: string;
    payment_method: string;
    max_trial_extension_days: number;
    auto_expire_trials: boolean;
}

// ===================================================================
// TYPES POUR LES PERMISSIONS
// ===================================================================

export interface SubscriptionPermissions {
    canViewAllSubscriptions: boolean;
    canActivatePaid: boolean;
    canDeactivatePaid: boolean;
    canExtendTrial: boolean;
    canViewSubscriptionStats: boolean;
    canManageOwnSubscription: boolean;
}

// ===================================================================
// TYPES POUR L'HISTORIQUE DES ACTIONS (FUTUR)
// ===================================================================

export interface SubscriptionHistoryEntry {
    id: string;
    user: string;
    action: 'activate' | 'deactivate' | 'extend' | 'expire';
    performed_by: string;
    performed_at: string;
    details: {
        previous_status?: SubscriptionStatus;
        new_status?: SubscriptionStatus;
        days_added?: number;
        notes?: string;
    };
}

// ===================================================================
// TYPES POUR LES HOOKS ET CONTEXTES
// ===================================================================

export interface SubscriptionContextType {
    // État global des abonnements
    myStatus: SubscriptionStatus | null;
    allUsersStatuses: SubscriptionStatus[];
    statistics: FormattedSubscriptionStatistics | null;
    isLoading: boolean;
    error: string | null;

    // Actions disponibles
    activatePaidAccount: (betLogin: string, notes?: string) => Promise<SubscriptionActionResult>;
    deactivatePaidAccount: (betLogin: string, notes?: string) => Promise<SubscriptionActionResult>;
    extendTrialPeriod: (betLogin: string, days: number, notes?: string) => Promise<SubscriptionActionResult>;
    refreshSubscriptionData: () => Promise<void>;

    // Utilitaires
    getSubscriptionDisplayInfo: (status: SubscriptionStatus) => SubscriptionDisplayInfo;
    getAvailableActions: (status: SubscriptionStatus, isCurrentUser: boolean) => SubscriptionActions;
    hasPermission: (action: string) => boolean;
}

// ===================================================================
// TYPES POUR LES COMPOSANTS D'INTERFACE
// ===================================================================

export interface SubscriptionBadgeProps {
    status: SubscriptionStatus;
    size?: 'sm' | 'md' | 'lg';
    showIcon?: boolean;
    showDescription?: boolean;
    interactive?: boolean;
    onPress?: () => void;
}

export interface SubscriptionActionsProps {
    user: {
        bet_login: string;
        current_status: SubscriptionStatus;
    };
    permissions: SubscriptionPermissions;
    isCurrentUser: boolean;
    onActionComplete?: (action: string, result: SubscriptionActionResult) => void;
    size?: 'sm' | 'md';
    layout?: 'horizontal' | 'vertical';
}

export interface SubscriptionModalProps {
    visible: boolean;
    config: SubscriptionModalConfig;
    onClose: () => void;
    loading?: boolean;
}

export interface SubscriptionStatsCardProps {
    title: string;
    value: number | string;
    icon: string;
    color: string;
    description?: string;
    trend?: {
        value: number;
        direction: 'up' | 'down' | 'stable';
    };
}

// ===================================================================
// TYPES POUR LA VALIDATION
// ===================================================================

export interface SubscriptionValidationRules {
    maxTrialExtensionDays: number;
    minTrialExtensionDays: number;
    maxNotesLength: number;
    allowSelfDeactivation: boolean;
    requireNotesForDeactivation: boolean;
}

export interface SubscriptionValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

// ===================================================================
// TYPES POUR LES FILTRES ET LA RECHERCHE
// ===================================================================

export interface SubscriptionFilters {
    accountType: AccountType | 'all';
    trialStatus: TrialStatus | 'all';
    accessLevel: AccessLevel | 'all';
    searchQuery: string;
    sortBy: 'created_at' | 'days_remaining' | 'bet_login';
    sortOrder: 'asc' | 'desc';
}

export interface SubscriptionSearchResult {
    users: UserWithSubscription[];
    totalCount: number;
    filteredCount: number;
    facets: {
        accountTypes: { [key in AccountType]: number };
        trialStatuses: { [key in TrialStatus]: number };
        accessLevels: { [key in AccessLevel]: number };
    };
}

// ===================================================================
// TYPES POUR L'EXPORT ET LES RAPPORTS
// ===================================================================

export interface SubscriptionReportConfig {
    includeUsers: boolean;
    includeStatistics: boolean;
    includeHistory: boolean;
    dateRange?: {
        start: string;
        end: string;
    };
    format: 'json' | 'csv' | 'xlsx';
}

export interface SubscriptionReport {
    generatedAt: string;
    generatedBy: string;
    config: SubscriptionReportConfig;
    data: {
        users?: UserWithSubscription[];
        statistics?: SubscriptionStatistics;
        history?: SubscriptionHistoryEntry[];
    };
    summary: {
        totalUsers: number;
        totalPaid: number;
        totalFree: number;
        conversionRate: number;
    };
}