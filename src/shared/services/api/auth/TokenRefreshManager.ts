// src/shared/services/api/auth/TokenRefreshManager.ts
// Session Bet261 : le token n'est valable que 5 min côté serveur. Le renouvellement passe par
// POST /api/refresh (le backend garde le refresh_token) : le mot de passe n'est plus conservé sur l'appareil.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '@/src/shared/services/api/auth/auth.api';
import { API_BASE_URL } from '@/src/shared/services/api/constant-api';

interface TokenData {
    token: string;
    userLogin: string;
    expiresAt: number; // ms epoch, calculé avec expires_in du serveur (pas de décalage d'horloge)
}

type RefreshOutcome = 'ok' | 'expired' | 'unavailable';

const TOKEN_KEY = 'token_data';
// Anciennes versions : le mot de passe était stocké en clair. À supprimer systématiquement.
const LEGACY_KEYS = ['saved_credentials'];

const REFRESH_MARGIN_MS = 60 * 1000; // renouveler 1 min avant l'expiration
const REQUEST_TIMEOUT_MS = 15 * 1000;
const MAX_ATTEMPTS = 2;
const RETRY_DELAY_MS = 1500;

class TokenRefreshManager {
    private static instance: TokenRefreshManager;
    private refreshPromise: Promise<RefreshOutcome> | null = null;
    private sessionExpiredListeners = new Set<() => void>();

    private constructor() {}

    public static getInstance(): TokenRefreshManager {
        if (!TokenRefreshManager.instance) {
            TokenRefreshManager.instance = new TokenRefreshManager();
        }
        return TokenRefreshManager.instance;
    }

    /**
     * S'abonner à la mort de la session (refresh refusé par le serveur) : l'UI doit alors
     * revenir à l'écran de login. Retourne la fonction de désabonnement.
     */
    onSessionExpired(listener: () => void): () => void {
        this.sessionExpiredListeners.add(listener);
        return () => {
            this.sessionExpiredListeners.delete(listener);
        };
    }

    private emitSessionExpired() {
        this.sessionExpiredListeners.forEach((listener) => listener());
    }

    /** Appelé après un login réussi. */
    async initialize(token: string, userLogin: string, expiresInSeconds: number): Promise<void> {
        await AsyncStorage.multiRemove(LEGACY_KEYS);
        await this.storeTokenData({
            token,
            userLogin,
            expiresAt: Date.now() + expiresInSeconds * 1000,
        });
    }

    /**
     * Au démarrage de l'app : retrouve la session si elle existe encore (renouvelle le token au besoin).
     * Retourne null s'il faut afficher le login.
     */
    async restoreSession(): Promise<{ token: string; userLogin: string } | null> {
        await AsyncStorage.multiRemove(LEGACY_KEYS);

        const data = await this.getStoredTokenData();
        if (!data) {
            return null;
        }

        if (data.expiresAt - Date.now() > REFRESH_MARGIN_MS) {
            return { token: data.token, userLogin: data.userLogin };
        }

        // Pas de notification ici : l'appelant route déjà vers le login si on retourne null.
        const outcome = await this.refreshToken(false);
        if (outcome !== 'ok') {
            return null;
        }

        const refreshed = await this.getStoredTokenData();
        return refreshed ? { token: refreshed.token, userLogin: refreshed.userLogin } : null;
    }

    /** Avant chaque requête : renouvelle le token s'il expire dans moins d'une minute. */
    async ensureValidToken(): Promise<boolean> {
        const data = await this.getStoredTokenData();
        if (!data) {
            return false;
        }

        if (data.expiresAt - Date.now() > REFRESH_MARGIN_MS) {
            return true;
        }

        const outcome = await this.refreshToken();
        if (outcome === 'ok') {
            return true;
        }
        // Serveur injoignable : on laisse partir la requête tant que le token n'est pas réellement expiré
        return outcome === 'unavailable' && data.expiresAt > Date.now();
    }

    /** Après un 401 du serveur. */
    async handleExpiredToken(): Promise<boolean> {
        return (await this.refreshToken()) === 'ok';
    }

    private async refreshToken(notifyOnExpiry: boolean = true): Promise<RefreshOutcome> {
        // Un seul refresh à la fois : Bet261 renouvelle aussi le refresh_token, deux appels simultanés se gêneraient
        if (this.refreshPromise) {
            return this.refreshPromise;
        }

        this.refreshPromise = this.performRefresh(notifyOnExpiry).finally(() => {
            this.refreshPromise = null;
        });
        return this.refreshPromise;
    }

    private async performRefresh(notifyOnExpiry: boolean): Promise<RefreshOutcome> {
        for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
            const data = await this.getStoredTokenData();
            if (!data) {
                return 'expired';
            }

            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

            try {
                const response = await fetch(`${API_BASE_URL}/api/refresh`, {
                    method: 'POST',
                    headers: { Accept: 'application/json', Authorization: `Bearer ${data.token}` },
                    signal: controller.signal,
                });

                if (response.ok) {
                    const body = await response.json();
                    await this.storeTokenData({
                        token: body.token,
                        userLogin: body.user_login ?? data.userLogin,
                        expiresAt: Date.now() + body.expires_in * 1000,
                    });
                    authService.setAuthToken(body.token);
                    return 'ok';
                }

                if (response.status === 401) {
                    // Le serveur ne reconnaît plus la session : inutile de réessayer
                    console.warn('TokenRefresh: session expirée côté serveur');
                    await this.clearTokenData();
                    if (notifyOnExpiry) {
                        this.emitSessionExpired();
                    }
                    return 'expired';
                }

                console.warn(`TokenRefresh: tentative ${attempt}/${MAX_ATTEMPTS}, HTTP ${response.status}`);
            } catch (error) {
                console.warn(`TokenRefresh: tentative ${attempt}/${MAX_ATTEMPTS} impossible:`, error);
            } finally {
                clearTimeout(timeout);
            }

            if (attempt < MAX_ATTEMPTS) {
                await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
            }
        }

        return 'unavailable';
    }

    private async storeTokenData(tokenData: TokenData): Promise<void> {
        try {
            await AsyncStorage.setItem(TOKEN_KEY, JSON.stringify(tokenData));
        } catch (error) {
            console.error('TokenRefresh: erreur stockage token:', error);
        }
    }

    private async getStoredTokenData(): Promise<TokenData | null> {
        try {
            const data = await AsyncStorage.getItem(TOKEN_KEY);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('TokenRefresh: erreur lecture token:', error);
            return null;
        }
    }

    async clearTokenData(): Promise<void> {
        try {
            await AsyncStorage.multiRemove([TOKEN_KEY, ...LEGACY_KEYS]);
        } catch (error) {
            console.error('TokenRefresh: erreur nettoyage:', error);
        }
    }
}

export const tokenRefreshManager = TokenRefreshManager.getInstance();