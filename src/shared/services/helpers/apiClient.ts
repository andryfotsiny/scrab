// src/shared/services/helpers/apiClient.ts (Updated)
import { API_BASE_URL } from "@/src/shared/services/api/constant-api";

export interface ApiClientResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
}

class ApiClient {
    private baseURL: string;
    private authToken: string | null = null;

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
    }

    // Get current auth token
    getAuthToken(): string | null {
        return this.authToken;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.baseURL}${endpoint}`;

        console.log(`🔗 ${options.method || 'GET'} request to:`, url);

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

            console.log('📡 Response status:', response.status);

            if (!response.ok) {
                // Handle specific auth errors
                if (response.status === 401) {
                    console.warn('🔒 Authentication failed - clearing token');
                    this.clearAuthToken();
                    throw new Error('Session expirée. Veuillez vous reconnecter.');
                }

                throw new Error(`Request failed: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('❌ Request error:', error);
            if (error instanceof TypeError && error.message.includes('Network request failed')) {
                throw new Error('Impossible de se connecter au serveur. Vérifiez votre connexion réseau.');
            }
            throw error;
        }
    }

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

        return this.request<T>(url, {
            method: 'GET',
        });
    }

    async post<T>(endpoint: string, body?: any, params?: Record<string, any>): Promise<T> {
        let url = endpoint;

        // Handle query parameters for POST requests
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

        return this.request<T>(url, {
            method: 'POST',
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    async put<T>(endpoint: string, body?: any, params?: Record<string, any>): Promise<T> {
        let url = endpoint;

        // Handle query parameters for PUT requests
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

        return this.request<T>(url, {
            method: 'PUT',
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    async delete<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'DELETE',
        });
    }

    async patch<T>(endpoint: string, body?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PATCH',
            body: body ? JSON.stringify(body) : undefined,
        });
    }
}

export const apiClient = new ApiClient(API_BASE_URL);