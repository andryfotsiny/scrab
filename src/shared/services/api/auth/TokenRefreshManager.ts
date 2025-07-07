// src/shared/services/auth/TokenRefreshManager.ts - VERSION CORRIGÉE
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '@/src/shared/services/api/auth/auth.api';

interface TokenData {
    token: string;
    userLogin: string;
    expiresAt: number;
    lastRefresh: number;
}

interface RefreshConfig {
    maxRetries: number;
    retryDelay: number;
    sessionTimeoutMinutes: number;
    preemptiveRefreshMinutes: number;
}

class TokenRefreshManager {
    private static instance: TokenRefreshManager;
    private refreshPromise: Promise<boolean> | null = null;
    private sessionTimer: ReturnType<typeof setTimeout> | null = null; // ✅ CORRIGÉ: Type correct

    private config: RefreshConfig = {
        maxRetries: 3,
        retryDelay: 2000,
        sessionTimeoutMinutes: 30, // ✅ Session de 30 minutes
        preemptiveRefreshMinutes: 2 // Refresh 2 min avant expiration
    };

    private constructor() {}

    public static getInstance(): TokenRefreshManager {
        if (!TokenRefreshManager.instance) {
            TokenRefreshManager.instance = new TokenRefreshManager();
        }
        return TokenRefreshManager.instance;
    }

    /**
     * ✅ MÉTHODE PRINCIPALE: Vérifie et rafraîchit le token si nécessaire
     */
    async ensureValidToken(): Promise<boolean> {
        try {
            const tokenData = await this.getStoredTokenData();
            if (!tokenData) {
                console.log('🔍 TokenRefresh: Aucun token stocké');
                return false;
            }

            const now = Date.now();
            const timeUntilExpiry = tokenData.expiresAt - now;

            // ✅ Refresh préventif (2 min avant expiration)
            const preemptiveRefreshMs = this.config.preemptiveRefreshMinutes * 60 * 1000;

            if (timeUntilExpiry <= preemptiveRefreshMs) {
                console.log(`🔄 TokenRefresh: Token expire dans ${Math.round(timeUntilExpiry / 1000)}s, refresh nécessaire`);
                return await this.refreshToken();
            }

            // ✅ Vérifier session timeout (30 min d'inactivité)
            const inactiveTime = now - tokenData.lastRefresh;
            const sessionTimeoutMs = this.config.sessionTimeoutMinutes * 60 * 1000;

            if (inactiveTime >= sessionTimeoutMs) {
                console.log(`⏰ TokenRefresh: Session inactive depuis ${Math.round(inactiveTime / 60000)}min, refresh nécessaire`);
                return await this.refreshToken();
            }

            console.log(`✅ TokenRefresh: Token valide pour encore ${Math.round(timeUntilExpiry / 60000)}min`);
            return true;

        } catch (error) {
            console.error('❌ TokenRefresh: Erreur vérification token:', error);
            return false;
        }
    }

    /**
     * ✅ Intercepteur pour les requêtes échouées (401/403)
     */
    async handleExpiredToken(): Promise<boolean> {
        console.log('🔄 TokenRefresh: Gestion token expiré détectée');

        // Éviter les refresh multiples simultanés
        if (this.refreshPromise) {
            console.log('🔄 TokenRefresh: Refresh déjà en cours, attente...');
            return await this.refreshPromise;
        }

        return await this.refreshToken();
    }

    /**
     * ✅ Effectue le refresh du token
     */
    private async refreshToken(): Promise<boolean> {
        // Éviter les refresh simultanés
        if (this.refreshPromise) {
            return await this.refreshPromise;
        }

        this.refreshPromise = this._performRefresh();
        const result = await this.refreshPromise;
        this.refreshPromise = null;

        return result;
    }

    /**
     * ✅ Logique de refresh avec retry
     */
    private async _performRefresh(): Promise<boolean> {
        const credentials = await this.getSavedCredentials();
        if (!credentials) {
            console.log('❌ TokenRefresh: Aucune credential sauvegardée pour refresh');
            return false;
        }

        for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
            try {
                console.log(`🔄 TokenRefresh: Tentative ${attempt}/${this.config.maxRetries}`);

                // ✅ Utilise la méthode Always Connect
                const result = await authService.login({
                    bet_login: credentials.betLogin,
                    bet_password: credentials.betPassword
                });

                if (result.success && result.token) {
                    // ✅ Sauvegarder le nouveau token
                    await this.storeTokenData({
                        token: result.token,
                        userLogin: result.user_login,
                        expiresAt: Date.now() + (10 * 60 * 1000), // Token Bet261 expire dans 10min
                        lastRefresh: Date.now()
                    });

                    // ✅ Mettre à jour authService
                    authService.setAuthToken(result.token);

                    console.log(`✅ TokenRefresh: Succès à la tentative ${attempt}`);
                    this.scheduleSessionTimeout();
                    return true;
                }

                // ✅ CORRIGÉ: Gestion des erreurs selon le type de LoginResponse
                const errorMessage = result.success === false
                    ? (result as any).error || result.message || 'Échec refresh token'
                    : 'Échec refresh token';

                throw new Error(errorMessage);

            } catch (error) {
                console.error(`❌ TokenRefresh: Tentative ${attempt} échouée:`, error);

                if (attempt < this.config.maxRetries) {
                    await this.delay(this.config.retryDelay * attempt); // Backoff exponentiel
                }
            }
        }

        console.error('❌ TokenRefresh: Toutes les tentatives ont échoué');
        await this.clearTokenData();
        return false;
    }

    /**
     * ✅ Programme la déconnexion automatique après 30min
     */
    private scheduleSessionTimeout() {
        if (this.sessionTimer) {
            clearTimeout(this.sessionTimer);
        }

        // ✅ CORRIGÉ: Cast explicite pour éviter l'erreur TypeScript
        this.sessionTimer = setTimeout(async () => {
            console.log('⏰ TokenRefresh: Session timeout atteint, déconnexion automatique');
            await this.clearTokenData();
            // Ici vous pouvez déclencher un event pour rediriger vers login
            // EventEmitter.emit('session_timeout');
        }, this.config.sessionTimeoutMinutes * 60 * 1000) as ReturnType<typeof setTimeout>;
    }

    /**
     * ✅ Stockage sécurisé des données de token
     */
    private async storeTokenData(tokenData: TokenData): Promise<void> {
        try {
            await AsyncStorage.setItem('token_data', JSON.stringify(tokenData));
        } catch (error) {
            console.error('❌ TokenRefresh: Erreur stockage token:', error);
        }
    }

    /**
     * ✅ Récupération des données de token
     */
    private async getStoredTokenData(): Promise<TokenData | null> {
        try {
            const data = await AsyncStorage.getItem('token_data');
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('❌ TokenRefresh: Erreur lecture token:', error);
            return null;
        }
    }

    /**
     * ✅ Récupération des credentials sauvegardées
     */
    private async getSavedCredentials(): Promise<{betLogin: string, betPassword: string} | null> {
        try {
            const data = await AsyncStorage.getItem('saved_credentials');
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('❌ TokenRefresh: Erreur lecture credentials:', error);
            return null;
        }
    }

    /**
     * ✅ Nettoyage des données
     */
    async clearTokenData(): Promise<void> {
        try {
            await AsyncStorage.multiRemove(['token_data', 'saved_credentials']);
            if (this.sessionTimer) {
                clearTimeout(this.sessionTimer);
                this.sessionTimer = null;
            }
        } catch (error) {
            console.error('❌ TokenRefresh: Erreur nettoyage:', error);
        }
    }

    /**
     * Utilitaire de délai
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * ✅ Initialise le manager avec les credentials actuelles
     */
    async initialize(token: string, userLogin: string, credentials: {betLogin: string, betPassword: string}): Promise<void> {
        await this.storeTokenData({
            token,
            userLogin,
            expiresAt: Date.now() + (10 * 60 * 1000), // 10 min
            lastRefresh: Date.now()
        });

        await AsyncStorage.setItem('saved_credentials', JSON.stringify(credentials));
        this.scheduleSessionTimeout();
    }
}

export const tokenRefreshManager = TokenRefreshManager.getInstance();