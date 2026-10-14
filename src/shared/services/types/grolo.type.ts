// src/features/football/types/index.ts

export interface FootballConfig {
    user?: string;
    constraints: {
        min_odds: number;
        max_odds: number;
        max_matches: number;
        max_total_odds: number;
        max_payout: number;
    };
    settings: {
        default_stake: number;
    };
    source: string;
    /** 'global' : cotes/limites imposées par l'admin ; 'personal' : celles du compte (admin) */
    constraints_source?: 'global' | 'personal';
    metadata: {
        created_at: string;
        updated_at: string;
        system_type: string;
    };
}

// Cotes et limites imposées par l'admin à tous les utilisateurs
export interface GlobalConstraints {
    min_odds: number;
    max_odds: number;
    max_matches: number;
    max_total_odds: number;
    max_payout: number;
}

export interface GlobalConfigResponse {
    constraints: GlobalConstraints;
    metadata: {
        updated_at: string | null;
        updated_by: number | null;
        is_default: boolean;
    };
}

export interface GlobalConfigUpdateRequest {
    min_odds?: number;
    max_odds?: number;
    max_matches?: number;
    max_total_odds?: number;
}

export interface FootballMatch {
    match: string;
    home_team: string;
    away_team: string;
    bet: string;
    odds: number;
    expected_start: string;
}

export interface FootballMatchesResponse {
    message: string;
    user?: string | null;
    total_matches: number;
    matches: FootballMatch[];
    summary: {
        total_odds: number;
        estimated_payout: number;
        default_stake: number;
    };
    constraints: {
        max_matches: number;
        max_total_odds: number;
        odds_range: string;
    };
    validation_status: string;
}

export interface ExecuteBetResponse {
    message: string;
    user: string;
    bet_id: number;
    total_matches: number;
    matches: FootballMatch[];
    total_odds: number;
    stake: number;
    potential_payout: number;
    execution_time: string;
}

export interface AutoExecutionResponse {
    message: string;
    user: string;
    execution_time?: string;
    timezone?: string;
    auto_execution_active: boolean;
    was_active?: boolean;
    started_at?: string;
}

export interface ConfigUpdateRequest {
    min_odds?: number;
    max_odds?: number;
    max_matches?: number;
    max_total_odds?: number;
    default_stake?: number;
}