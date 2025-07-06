// src/features/football/types/mini.ts

export interface MiniConfig {
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
    system_type: string;
    source?: string;
    metadata?: {
        created_at?: string;
        updated_at?: string;
        system_type?: string;
        [key: string]: any;
    };
}

export interface MiniMatch {
    match: string;
    home_team: string;
    away_team: string;
    bet: string;
    odds: number;
    expected_start: string;
}

export interface MiniMatchesResponse {
    message: string;
    user?: string | null;
    total_matches: number;
    matches: MiniMatch[];
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
    system_type: string;
}

export interface MiniExecuteBetResponse {
    message: string;
    user: string;
    bet_id: number;
    total_matches: number;
    matches: MiniMatch[];
    total_odds: number;
    stake: number;
    potential_payout: number;
    execution_time: string;
    system_type: string;
}

export interface MiniAutoExecutionResponse {
    message: string;
    user: string;
    execution_time?: string;
    timezone?: string;
    system_type?: string;
    mini_auto_execution_active: boolean;
    was_active?: boolean;
    started_at?: string;
}

export interface MiniConfigUpdateRequest {
    min_odds?: number;
    max_odds?: number;
    max_total_odds?: number;
    default_stake?: number;
}