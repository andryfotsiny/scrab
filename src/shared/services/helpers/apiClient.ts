// src/shared/services/helpers/apiClient.ts - ADAPTED pour React Query
import { API_BASE_URL } from "@/src/shared/services/api/constant-api";
import { tokenRefreshManager } from '@/src/shared/services/api/auth/TokenRefreshManager';

export interface ApiClientResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
}

class ApiClient {
    private baseURL: string;
    private authToken: string | null = null;
    private isRefreshing = false;
    private refreshPromise: Promise<boolean> | null = null;

    constructor(baseURL: string) {
        this.baseURL = baseURL;
    }

    // Set authentication token
    setAuthToken(token: string) {
        this.authToken = token;
    }

    // Clear authentication token
    clearAuthToken() {
        this.authToken = null;
        // ✅ Nettoyer aussi le refresh manager
        if (tokenRefreshManager) {
            tokenRefreshManager.clearTokenData();
        }
    }

    // Get current auth token
    getAuthToken(): string | null {
        return this.authToken;
    }

    /**
     * ✅ NOUVELLE MÉTHODE: Request avec auto-refresh intégré pour React Query
     */
    private async requestWithAutoRefresh<T>(
        endpoint: string,
        options: RequestInit = {},
        maxRetries: number = 1
    ): Promise<T> {
        // ✅ 1. Vérifier et refresher le token si nécessaire AVANT la requête
        if (this.authToken && tokenRefreshManager) {
            const tokenValid = await tokenRefreshManager.ensureValidToken();
            if (!tokenValid) {
                throw new Error('Session expirée. Veuillez vous reconnecter.');
            }
        }

        // ✅ 2. Tenter la requête
        try {
            const response = await this.request<T>(endpoint, options);
            return response;
        } catch (error) {
            // ✅ 3. Si erreur d'authentification ET retry possible
            if (this.isAuthError(error) && maxRetries > 0 && tokenRefreshManager) {

                // ✅ 4. Tenter refresh du token
                const refreshSuccess = await tokenRefreshManager.handleExpiredToken();

                if (refreshSuccess) {
                    // ✅ 5. Retry avec le nouveau token
                    return await this.requestWithAutoRefresh<T>(endpoint, options, maxRetries - 1);
                }
            }

            // ✅ 6. Si refresh échoue ou plus de retry, propager l'erreur
            throw error;
        }
    }

    /**
     * ✅ Méthode request originale (inchangée)
     */
    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.baseURL}${endpoint}`;


        const headers: Record<string, string> = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            ...options.headers as Record<string, string>,
        };

        // Add authorization header if token exists
        if (this.authToken) {
            headers['Authorization'] = `Bearer ${this.authToken}`;
        }

        try {
            const response = await fetch(url, {
                headers,
                ...options,
            });


            if (!response.ok) {
                // Handle specific auth errors
                if (response.status === 401 || response.status === 403) {
                    console.warn('Authentication failed - token expired or invalid');
                    throw new AuthError(`Authentication failed: ${response.status} - ${response.statusText}`, response.status);
                }

                // Le backend renvoie un message lisible dans `detail` : le garder au lieu de le perdre.
                // Le code HTTP voyage dans `status` (les règles de retry ne doivent pas lire le texte du message).
                const body = await response.json().catch(() => null);
                const detail = typeof body?.detail === 'string' && body.detail ? body.detail : null;
                throw new ApiError(detail || `Request failed: ${response.status} - ${response.statusText}`, response.status);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            if (error instanceof AuthError) {
                // 401/403 attendu : le token est renouvelé puis la requête rejouée (requestWithAutoRefresh)
            } else {
                console.error('Request error:', error);
            }
            if (error instanceof TypeError && error.message.includes('Network request failed')) {
                throw new Error('Impossible de se connecter au serveur. Vérifiez votre connexion réseau.');
            }
            throw error;
        }
    }

    /**
     * ✅ Détecte les erreurs d'authentification
     */
    private isAuthError(error: any): boolean {
        return error instanceof AuthError ||
            error?.status === 401 || error?.status === 403 ||
            (error?.message && (
                error.message.includes('Authentication failed') ||
                error.message.includes('Session expirée')
            ));
    }

    /**
     * ✅ MÉTHODES PUBLIQUES - optimisées pour React Query
     */
    async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
        let url = endpoint;

        if (params) {
            const searchParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    searchParams.append(key, String(value));
                }
            });
            const queryString = searchParams.toString();
            if (queryString) {
                url += `?${queryString}`;
            }
        }

        // ✅ Utiliser auto-refresh si token présent
        if (this.authToken) {
            return this.requestWithAutoRefresh<T>(url, { method: 'GET' });
        } else {
            return this.request<T>(url, { method: 'GET' });
        }
    }

    async post<T>(endpoint: string, body?: any, params?: Record<string, any>): Promise<T> {
        let url = endpoint;

        if (params) {
            const searchParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    searchParams.append(key, String(value));
                }
            });
            const queryString = searchParams.toString();
            if (queryString) {
                url += `?${queryString}`;
            }
        }

        const options: RequestInit = {
            method: 'POST',
            body: body ? JSON.stringify(body) : undefined,
        };

        // ✅ Utiliser auto-refresh si token présent
        if (this.authToken) {
            return this.requestWithAutoRefresh<T>(url, options);
        } else {
            return this.request<T>(url, options);
        }
    }

    async put<T>(endpoint: string, body?: any, params?: Record<string, any>): Promise<T> {
        let url = endpoint;

        if (params) {
            const searchParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    searchParams.append(key, String(value));
                }
            });
            const queryString = searchParams.toString();
            if (queryString) {
                url += `?${queryString}`;
            }
        }

        const options: RequestInit = {
            method: 'PUT',
            body: body ? JSON.stringify(body) : undefined,
        };

        // ✅ Utiliser auto-refresh si token présent
        if (this.authToken) {
            return this.requestWithAutoRefresh<T>(url, options);
        } else {
            return this.request<T>(url, options);
        }
    }

    async delete<T>(endpoint: string): Promise<T> {
        // ✅ Utiliser auto-refresh si token présent
        if (this.authToken) {
            return this.requestWithAutoRefresh<T>(endpoint, { method: 'DELETE' });
        } else {
            return this.request<T>(endpoint, { method: 'DELETE' });
        }
    }

    async patch<T>(endpoint: string, body?: any): Promise<T> {
        const options: RequestInit = {
            method: 'PATCH',
            body: body ? JSON.stringify(body) : undefined,
        };

        // ✅ Utiliser auto-refresh si token présent
        if (this.authToken) {
            return this.requestWithAutoRefresh<T>(endpoint, options);
        } else {
            return this.request<T>(endpoint, options);
        }
    }

    // ✅ NOUVELLES MÉTHODES pour React Query

    /**
     * Méthode spéciale pour les requêtes sans auth (ex: données publiques)
     */
    async getPublic<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
        let url = endpoint;

        if (params) {
            const searchParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    searchParams.append(key, String(value));
                }
            });
            const queryString = searchParams.toString();
            if (queryString) {
                url += `?${queryString}`;
            }
        }

        // Toujours utiliser la méthode simple pour les données publiques
        return this.request<T>(url, { method: 'GET' });
    }

    /**
     * Vérifier si une requête nécessite l'authentification
     */
    requiresAuth(endpoint: string): boolean {
        const publicEndpoints = [
            '/api/betting/mini/matches', // Matchs publics
            '/api/public/',
            '/health',
        ];

        return !publicEndpoints.some(publicEndpoint => endpoint.startsWith(publicEndpoint));
    }
}

/**
 * Erreur HTTP du backend : `message` = `detail` lisible du serveur, `status` = code HTTP.
 */
class ApiError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

/**
 * ✅ Classe d'erreur spécifique pour l'authentification (401/403)
 */
class AuthError extends ApiError {
    constructor(message: string, status: number = 401) {
        super(message, status);
        this.name = 'AuthError';
    }
}

/**
 * Vrai si le serveur a répondu avec une erreur client (4xx) : renvoyer la même requête ne changera rien
 * (et pour un pari, ce serait dangereux).
 */
export function isClientError(error: unknown): boolean {
    const status = (error as { status?: number } | null)?.status;
    return typeof status === 'number' && status >= 400 && status < 500;
}

export const apiClient = new ApiClient(API_BASE_URL);
export { AuthError, ApiError };