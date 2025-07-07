// src/shared/services/api/auth/auth.api.ts - ENHANCED avec Auto-Refresh
import { apiClient } from "@/src/shared/services/helpers/apiClient";
import { LoginRequest, LoginResponse, LocalUserInfo, Bet261UserData } from "@/src/features/auth/types";
import { tokenRefreshManager } from '@/src/shared/services/api/auth/TokenRefreshManager';

class AuthService {
    private authToken: string | null = null;

    // Set authentication token for subsequent requests
    setAuthToken(token: string) {
        this.authToken = token;
        // ✅ Synchroniser avec apiClient
        apiClient.setAuthToken(token);
    }

    // Clear authentication token
    clearAuthToken() {
        this.authToken = null;
        apiClient.clearAuthToken();
        // ✅ Nettoyer aussi le refresh manager
        tokenRefreshManager.clearTokenData();
    }

    // Get current auth token
    getAuthToken(): string | null {
        return this.authToken;
    }

    // ✅ MÉTHODE MODIFIÉE: Login avec initialisation du refresh manager
    async login(loginData: LoginRequest): Promise<LoginResponse> {
        try {
            console.log('🔐 AuthService: Attempting login for user:', loginData.bet_login);

            // ✅ Utiliser la requête normale (pas d'auto-refresh pour le login)
            const response = await fetch(`${apiClient['baseURL']}/api/login`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginData)
            });

            if (!response.ok) {
                throw new Error(`Login failed: ${response.status} - ${response.statusText}`);
            }

            const loginResponse: LoginResponse = await response.json();

            // ✅ Stocker le token et initialiser le refresh manager
            if (loginResponse.token) {
                this.setAuthToken(loginResponse.token);

                // ✅ Initialiser le système de refresh avec les credentials
                await tokenRefreshManager.initialize(
                    loginResponse.token,
                    loginResponse.user_login,
                    {
                        betLogin: loginData.bet_login,
                        betPassword: loginData.bet_password
                    }
                );

                console.log('✅ AuthService: Token et refresh manager initialisés');
            }

            return loginResponse;
        } catch (error) {
            console.error('❌ AuthService: Login error:', error);
            throw error;
        }
    }

    // ✅ MÉTHODE INCHANGÉE: Get local user info (utilise auto-refresh via apiClient)
    async getUserInfo(): Promise<LocalUserInfo> {
        try {
            if (!this.authToken) {
                throw new Error('No authentication token available');
            }

            return await apiClient.get<LocalUserInfo>('/api/user-info');
        } catch (error) {
            console.error('❌ Get user info error:', error);
            throw error;
        }
    }

    // ✅ MÉTHODE INCHANGÉE: Get Bet261 user data (utilise auto-refresh via apiClient)
    async getBet261UserInfo(): Promise<Bet261UserData> {
        try {
            if (!this.authToken) {
                throw new Error('No authentication token available');
            }

            return await apiClient.get<Bet261UserData>('/api/bet261-user-info');
        } catch (error) {
            console.error('❌ Get Bet261 user info error:', error);
            throw error;
        }
    }

    // ✅ MÉTHODE INCHANGÉE: Get account configuration (utilise auto-refresh via apiClient)
    async getConfiguration(): Promise<any> {
        try {
            if (!this.authToken) {
                throw new Error('No authentication token available');
            }

            return await apiClient.get<any>('/api/configuration');
        } catch (error) {
            console.error('❌ Get configuration error:', error);
            throw error;
        }
    }

    // ✅ MÉTHODE MODIFIÉE: Logout avec nettoyage du refresh manager
    async logout(): Promise<{ message: string; logged_out_user: string }> {
        try {
            if (!this.authToken) {
                throw new Error('No authentication token available');
            }

            // ✅ Tentative de logout côté serveur (avec auto-refresh si nécessaire)
            let response;
            try {
                response = await apiClient.post<{ message: string; logged_out_user: string }>('/api/logout');
            } catch (error) {
                // ✅ Si le logout serveur échoue, continuer avec le nettoyage local
                console.warn('⚠️ AuthService: Server logout failed, proceeding with local cleanup:', error);
            }

            // ✅ Nettoyer les tokens et le refresh manager
            this.clearAuthToken();

            return response || {
                message: 'Déconnexion locale réussie',
                logged_out_user: 'unknown'
            };
        } catch (error) {
            console.error('❌ Logout error:', error);
            // ✅ Nettoyer même en cas d'erreur
            this.clearAuthToken();
            throw error;
        }
    }

    // ✅ NOUVELLE MÉTHODE: Vérifier si la session est encore valide
    async isSessionValid(): Promise<boolean> {
        if (!this.authToken) {
            return false;
        }

        return await tokenRefreshManager.ensureValidToken();
    }

    // ✅ NOUVELLE MÉTHODE: Forcer un refresh manuel
    async refreshSession(): Promise<boolean> {
        if (!this.authToken) {
            return false;
        }

        return await tokenRefreshManager.handleExpiredToken();
    }
}

export const authService = new AuthService();