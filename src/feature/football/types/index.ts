// src/feature/football/types/index.ts

export interface FootballConfig {
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
    metadata: {
        created_at: string;
        updated_at: string;
        system_type: string;
    };
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
    execution_time?: string;
    timezone?: string;
    auto_execution_active: boolean;
    was_active?: boolean;
}

export interface ConfigUpdateRequest {
    min_odds?: number;
    max_odds?: number;
    max_matches?: number;
    max_total_odds?: number;
    default_stake?: number;
}