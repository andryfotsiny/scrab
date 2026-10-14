// src/shared/services/api/auth/auth.api.ts - ENHANCED avec Auto-Refresh
import { apiClient, ApiError } from "@/src/shared/services/helpers/apiClient";
import { API_BASE_URL } from "@/src/shared/services/api/constant-api";
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
                // Le backend répond avec un `detail` lisible (« Numéro ou mot de passe incorrect. »...)
                const body = await response.json().catch(() => null);
                const detail = typeof body?.detail === 'string' && body.detail ? body.detail : null;
                throw new ApiError(detail || `Connexion impossible (erreur ${response.status}).`, response.status);
            }

            const loginResponse: LoginResponse = await response.json();

            // ✅ Stocker le token et initialiser le refresh manager
            if (loginResponse.token) {
                this.setAuthToken(loginResponse.token);

                // ✅ Mémoriser le token et son expiration réelle (5 min chez Bet261). Le mot de passe n'est PAS conservé :
                // le renouvellement passe par /api/refresh.
                await tokenRefreshManager.initialize(
                    loginResponse.token,
                    loginResponse.user_login,
                    loginResponse.expires_in ?? 300
                );

            }

            return loginResponse;
        } catch (error) {
            console.error('AuthService: Login error:', error);
            if (error instanceof TypeError) {
                throw new Error('Impossible de joindre le serveur. Vérifiez votre connexion.');
            }
            throw error;
        }
    }

    // ✅ Au démarrage : retrouver la session mémorisée (renouvelle le token si besoin)
    async restoreSession(): Promise<{ token: string; userLogin: string } | null> {
        const session = await tokenRefreshManager.restoreSession();
        if (session) {
            this.setAuthToken(session.token);
        }
        return session;
    }

    // ✅ MÉTHODE INCHANGÉE: Get local user info (utilise auto-refresh via apiClient)
    async getUserInfo(): Promise<LocalUserInfo> {
        try {
            if (!this.authToken) {
                throw new Error('No authentication token available');
            }

            return await apiClient.get<LocalUserInfo>('/api/user-info');
        } catch (error) {
            console.error('Get user info error:', error);
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
            console.error('Get Bet261 user info error:', error);
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
            console.error('Get configuration error:', error);
            throw error;
        }
    }

    // ✅ Logout : tentative côté serveur (au mieux), puis nettoyage local TOUJOURS effectué
    async logout(): Promise<{ message: string; logged_out_user: string }> {
        const token = this.authToken;
        let result = { message: 'Déconnexion locale réussie', logged_out_user: 'unknown' };

        if (token) {
            try {
                // fetch direct (pas apiClient) : inutile de renouveler un token juste pour se déconnecter,
                // et le backend accepte un token expiré sur /api/logout
                const response = await fetch(`${API_BASE_URL}/api/logout`, {
                    method: 'POST',
                    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
                });
                if (response.ok) {
                    result = await response.json();
                }
            } catch (error) {
                console.warn('AuthService: Server logout failed, proceeding with local cleanup:', error);
            }
        }

        this.clearAuthToken();
        return result;
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