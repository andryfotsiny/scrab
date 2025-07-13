// src/shared/services/api/subscription/subscription.api.ts - VERSION CORRIGÉE

import { apiClient } from "@/src/shared/services/helpers/apiClient";

// Types pour les requêtes d'abonnement - CORRIGÉS
export interface ActivateAccountRequest {
    bet_login: string; // 🔧 Correction : doit être string, pas number
    notes?: string;
}

export interface ExtendTrialRequest {
    bet_login: string; // 🔧 Correction : doit être string, pas number
    additional_days: number;
    notes?: string;
}

// Types pour les réponses d'abonnement
export interface SubscriptionStatus {
    user: string;
    account_type: 'gratuit' | 'payant';
    status_payant: boolean;
    access_level: 'complet' | 'limite';
    trial_status: 'non_demarre' | 'actif' | 'expire' | 'non_applicable';
    days_remaining: number | null;
    created_at: string;
    can_use_premium_features: boolean;
}

export interface SubscriptionStatusResponse {
    success: boolean;
    data?: SubscriptionStatus;
    error?: string;
}

export interface AllUsersSubscriptionResponse {
    success: boolean;
    data?: {
        users: SubscriptionStatus[];
        statistics: {
            total_users: number;
            paid_users: number;
            free_users: number;
            trial_active: number;
            trial_expired: number;
            trial_not_started: number;
            conversion_rate: number;
        };
    };
    requested_by?: string;
    error?: string;
}

export interface SubscriptionActionResponse {
    success: boolean;
    message?: string;
    data?: {
        user: string;
        activated_by?: string;
        deactivated_by?: string;
        extended_by?: string;
        notes?: string;
        additional_days?: number;
        previous_status?: SubscriptionStatus;
        new_status?: SubscriptionStatus;
        previous_days?: number;
        new_days?: number;
    };
    error?: string;
}

export interface SubscriptionInfo {
    success: boolean;
    data: {
        trial_period_days: number;
        trial_description: string;
        premium_features: string[];
        how_to_upgrade: string;
        payment_method: string;
    };
}

class SubscriptionService {

    // ===================================================================
    // CONSULTATION DES STATUTS
    // ===================================================================

    /**
     * Récupère mon statut d'abonnement
     */
    async getMySubscriptionStatus(): Promise<SubscriptionStatusResponse> {
        try {
            console.log('🔍 SubscriptionService: Récupération de mon statut...');
            return await apiClient.get<SubscriptionStatusResponse>('/api/subscription/my-status');
        } catch (error) {
            console.error('❌ SubscriptionService: Erreur récupération mon statut:', error);
            throw error;
        }
    }

    /**
     * Récupère le statut d'abonnement d'un utilisateur spécifique
     */
    async getUserSubscriptionStatus(betLogin: string): Promise<SubscriptionStatusResponse> {
        try {
            console.log('🔍 SubscriptionService: Récupération statut utilisateur:', betLogin);
            return await apiClient.get<SubscriptionStatusResponse>(`/api/subscription/user/${betLogin}/status`);
        } catch (error) {
            console.error('❌ SubscriptionService: Erreur récupération statut utilisateur:', error);
            throw error;
        }
    }

    /**
     * Vérifie l'accès premium d'un utilisateur
     */
    async checkPremiumAccess(): Promise<{
        success: boolean;
        data: {
            user: string;
            has_premium_access: boolean;
            subscription_status: SubscriptionStatus;
        };
    }> {
        try {
            console.log('🔍 SubscriptionService: Vérification accès premium...');
            return await apiClient.get('/api/subscription/check-premium-access');
        } catch (error) {
            console.error('❌ SubscriptionService: Erreur vérification accès premium:', error);
            throw error;
        }
    }

    /**
     * Récupère les informations générales sur le système d'abonnement
     */
    async getSubscriptionInfo(): Promise<SubscriptionInfo> {
        try {
            console.log('ℹ️ SubscriptionService: Récupération infos système...');
            return await apiClient.get<SubscriptionInfo>('/api/subscription/subscription-info');
        } catch (error) {
            console.error('❌ SubscriptionService: Erreur récupération infos système:', error);
            throw error;
        }
    }

    // ===================================================================
    // ADMINISTRATION - Actions sur les abonnements - CORRIGÉES
    // ===================================================================

    /**
     * Récupère le statut d'abonnement de tous les utilisateurs (Admin seulement)
     */
    async getAllUsersSubscriptionStatus(): Promise<AllUsersSubscriptionResponse> {
        try {
            console.log('👥 SubscriptionService: Récupération statuts tous utilisateurs...');
            return await apiClient.get<AllUsersSubscriptionResponse>('/api/subscription/admin/all-users-status');
        } catch (error) {
            console.error('❌ SubscriptionService: Erreur récupération statuts utilisateurs:', error);
            throw error;
        }
    }

    /**
     * Active le mode payant pour un utilisateur (Admin seulement) - CORRIGÉE
     */
    async activatePaidAccount(request: ActivateAccountRequest): Promise<SubscriptionActionResponse> {
        try {
            console.log('⬆️ SubscriptionService: Activation mode payant:', request.bet_login);

            // 🔧 CORRECTION: S'assurer que bet_login est bien une string
            const payload = {
                bet_login: String(request.bet_login), // Conversion explicite en string
                notes: request.notes || 'Activé via interface admin'
            };

            console.log('📤 Payload envoyé:', payload);

            return await apiClient.post<SubscriptionActionResponse>('/api/subscription/admin/activate-paid', payload);
        } catch (error) {
            console.error('❌ SubscriptionService: Erreur activation mode payant:', error);
            throw error;
        }
    }

    /**
     * Désactive le mode payant pour un utilisateur (Admin seulement) - CORRIGÉE
     */
    async deactivatePaidAccount(request: ActivateAccountRequest): Promise<SubscriptionActionResponse> {
        try {
            console.log('⬇️ SubscriptionService: Désactivation mode payant:', request.bet_login);

            // 🔧 CORRECTION: S'assurer que bet_login est bien une string
            const payload = {
                bet_login: String(request.bet_login), // Conversion explicite en string
                notes: request.notes || 'Désactivé via interface admin'
            };

            console.log('📤 Payload envoyé:', payload);

            return await apiClient.post<SubscriptionActionResponse>('/api/subscription/admin/deactivate-paid', payload);
        } catch (error) {
            console.error('❌ SubscriptionService: Erreur désactivation mode payant:', error);
            throw error;
        }
    }

    /**
     * Prolonge la période gratuite d'un utilisateur (Admin seulement) - CORRIGÉE
     */
    async extendTrialPeriod(request: ExtendTrialRequest): Promise<SubscriptionActionResponse> {
        try {
            console.log('⏰ SubscriptionService: Prolongation période gratuite:', request.bet_login, '+', request.additional_days, 'jours');

            // 🔧 CORRECTION: S'assurer que les types sont corrects
            const payload = {
                bet_login: String(request.bet_login), // Conversion explicite en string
                additional_days: Number(request.additional_days), // Conversion explicite en number
                notes: request.notes || 'Prolongé via interface admin'
            };

            console.log('📤 Payload envoyé:', payload);

            return await apiClient.post<SubscriptionActionResponse>('/api/subscription/admin/extend-trial', payload);
        } catch (error) {
            console.error('❌ SubscriptionService: Erreur prolongation période gratuite:', error);
            throw error;
        }
    }

    // ===================================================================
    // MÉTHODES UTILITAIRES
    // ===================================================================

    /**
     * Formate le statut d'abonnement pour l'affichage
     */
    formatSubscriptionStatus(status: SubscriptionStatus): {
        label: string;
        color: string;
        description: string;
        icon: string;
    } {
        if (status.status_payant) {
            return {
                label: 'Payant',
                color: '#10B981', // success
                description: 'Accès illimité à toutes les fonctionnalités',
                icon: 'diamond'
            };
        }

        switch (status.trial_status) {
            case 'non_demarre':
                return {
                    label: 'Nouveau',
                    color: '#3B82F6', // primary
                    description: '7 jours gratuits disponibles',
                    icon: 'gift'
                };
            case 'actif':
                return {
                    label: `Gratuit (${status.days_remaining}j)`,
                    color: '#F59E0B', // warning
                    description: `Période d'essai active - ${status.days_remaining} jour(s) restant(s)`,
                    icon: 'time'
                };
            case 'expire':
                return {
                    label: 'Expiré',
                    color: '#EF4444', // error
                    description: 'Période d\'essai expirée - Fonctionnalités limitées',
                    icon: 'alert-circle'
                };
            default:
                return {
                    label: 'Inconnu',
                    color: '#6B7280', // textSecondary
                    description: 'Statut non déterminé',
                    icon: 'help-circle'
                };
        }
    }

    /**
     * Détermine les actions disponibles pour un utilisateur
     */
    getAvailableActions(
        status: SubscriptionStatus,
        isCurrentUser: boolean,
        permissions: {
            canActivatePaid: boolean;
            canDeactivatePaid: boolean;
            canExtendTrial: boolean;
            canViewAllSubscriptions: boolean;
            canViewSubscriptionStats: boolean;
        }
    ): {
        canActivatePaid: boolean;
        canDeactivatePaid: boolean;
        canExtendTrial: boolean;
        canViewDetails: boolean;
    } {
        return {
            // Peut activer le mode payant si :
            // - L'utilisateur n'est pas déjà payant
            // - L'admin a les permissions
            canActivatePaid: !status.status_payant && permissions.canActivatePaid,

            // Peut désactiver le mode payant si :
            // - L'utilisateur est actuellement payant
            // - Ce n'est pas l'utilisateur actuel (pas d'auto-désactivation)
            // - L'admin a les permissions
            canDeactivatePaid: status.status_payant && !isCurrentUser && permissions.canDeactivatePaid,

            // Peut étendre la période gratuite si :
            // - L'utilisateur n'est pas en mode payant
            // - L'admin a les permissions
            canExtendTrial: !status.status_payant && permissions.canExtendTrial,

            // Peut toujours voir les détails
            canViewDetails: true
        };
    }

    /**
     * Valide une demande d'extension de période gratuite
     */
    validateTrialExtension(days: number): { isValid: boolean; error?: string } {
        if (days <= 0) {
            return { isValid: false, error: 'Le nombre de jours doit être positif' };
        }
        if (days > 365) {
            return { isValid: false, error: 'Maximum 365 jours d\'extension' };
        }
        return { isValid: true };
    }
}

export const subscriptionService = new SubscriptionService();