// src/shared/services/api/auth/auth.api.ts
import { apiClient } from "@/src/shared/services/helpers/apiClient";
import { LoginRequest, LoginResponse, LocalUserInfo, Bet261UserData } from "@/src/features/auth/types";

class AuthService {
    private authToken: string | null = null;

    // Set authentication token for subsequent requests
    setAuthToken(token: string) {
        this.authToken = token;
    }

    // Clear authentication token
    clearAuthToken() {
        this.authToken = null;
    }

    // Get current auth token
    getAuthToken(): string | null {
        return this.authToken;
    }

    // Update apiClient to include auth header
    private async authenticatedRequest<T>(endpoint: string, method: 'GET' | 'POST' = 'GET', options: any = {}): Promise<T> {
        const headers = {
            ...options.headers,
            ...(this.authToken && { 'Authorization': `Bearer ${this.authToken}` })
        };

        if (method === 'GET') {
            return await apiClient.get<T>(endpoint, options.params);
        } else if (method === 'POST') {
            return await apiClient.post<T>(endpoint, options.body, options.params);
        }

        throw new Error('Unsupported HTTP method');
    }

    // Login with user credentials
    async login(loginData: LoginRequest): Promise<LoginResponse> {
        try {
            console.log('🔐 Attempting login for user:', loginData.bet_login);
            const response = await apiClient.post<LoginResponse>('/api/login', loginData);

            // Store the token for subsequent requests
            if (response.token) {
                this.setAuthToken(response.token);
            }

            return response;
        } catch (error) {
            console.error('❌ Login error:', error);
            throw error;
        }
    }

    // Get local user info (requires authentication)
    async getUserInfo(): Promise<LocalUserInfo> {
        try {
            if (!this.authToken) {
                throw new Error('No authentication token available');
            }

            // Sync token with apiClient before making request
            apiClient.setAuthToken(this.authToken);
            return await apiClient.get<LocalUserInfo>('/api/user-info');
        } catch (error) {
            console.error('❌ Get user info error:', error);
            throw error;
        }
    }

    // Get Bet261 user data (requires authentication)
    async getBet261UserInfo(): Promise<Bet261UserData> {
        try {
            if (!this.authToken) {
                throw new Error('No authentication token available');
            }

            // Sync token with apiClient before making request
            apiClient.setAuthToken(this.authToken);
            return await apiClient.get<Bet261UserData>('/api/bet261-user-info');
        } catch (error) {
            console.error('❌ Get Bet261 user info error:', error);
            throw error;
        }
    }

    // Get account configuration (requires authentication)
    async getConfiguration(): Promise<any> {
        try {
            if (!this.authToken) {
                throw new Error('No authentication token available');
            }

            // Sync token with apiClient before making request
            apiClient.setAuthToken(this.authToken);
            return await apiClient.get<any>('/api/configuration');
        } catch (error) {
            console.error('❌ Get configuration error:', error);
            throw error;
        }
    }

    // Logout user (requires authentication)
    async logout(): Promise<{ message: string; logged_out_user: string }> {
        try {
            if (!this.authToken) {
                throw new Error('No authentication token available');
            }

            // Sync token with apiClient before making request
            apiClient.setAuthToken(this.authToken);
            const response = await apiClient.post<{ message: string; logged_out_user: string }>('/api/logout');

            // Clear the token after successful logout
            this.clearAuthToken();
            apiClient.clearAuthToken();

            return response;
        } catch (error) {
            console.error('❌ Logout error:', error);
            // Clear token even if logout fails
            this.clearAuthToken();
            apiClient.clearAuthToken();
            throw error;
        }
    }
}

export const authService = new AuthService();