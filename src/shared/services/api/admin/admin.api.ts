// src/shared/services/api/admin/admin.api.ts
import { apiClient } from "@/src/shared/services/helpers/apiClient";
import {
    AdminListResponse,
    UsersListResponse,
    UserRole,
    PromoteRequest,
    DemoteRequest,
    PromoteResponse,
    DemoteResponse,
    SystemStatus,
    AuthenticatedUsersResponse,
    ApiResponse
} from "@/src/features/admin/types/admin.types";

class AdminService {

    // ===================================================================
    // GESTION DES RÔLES
    // ===================================================================

    /**
     * Récupère le rôle de l'utilisateur connecté
     */
    async getMyRole(): Promise<UserRole> {
        try {
            console.log('🎭 AdminService: Récupération de mon rôle...');
            return await apiClient.get<UserRole>('/api/admin/my-role');
        } catch (error) {
            console.error('❌ AdminService: Erreur récupération rôle:', error);
            throw error;
        }
    }

    /**
     * Récupère le rôle d'un utilisateur spécifique
     */
    async getUserRole(betLogin: string): Promise<UserRole> {
        try {
            console.log('🎭 AdminService: Récupération rôle utilisateur:', betLogin);
            return await apiClient.get<UserRole>(`/api/admin/role/${betLogin}`);
        } catch (error) {
            console.error('❌ AdminService: Erreur récupération rôle utilisateur:', error);
            throw error;
        }
    }

    // ===================================================================
    // GESTION DES UTILISATEURS
    // ===================================================================

    /**
     * Récupère la liste de tous les utilisateurs avec leurs rôles
     */
    async getAllUsers(): Promise<UsersListResponse> {
        try {
            console.log('👥 AdminService: Récupération liste utilisateurs...');
            return await apiClient.get<UsersListResponse>('/api/users/list');
        } catch (error) {
            console.error('❌ AdminService: Erreur récupération utilisateurs:', error);
            throw error;
        }
    }

    /**
     * Récupère les informations détaillées d'un utilisateur
     */
    async getUserInfo(betLogin: string): Promise<any> {
        try {
            console.log('👤 AdminService: Récupération infos utilisateur:', betLogin);
            return await apiClient.get(`/api/users/${betLogin}/info`);
        } catch (error) {
            console.error('❌ AdminService: Erreur récupération infos utilisateur:', error);
            throw error;
        }
    }

    /**
     * Récupère la liste des utilisateurs connectés
     */
    async getAuthenticatedUsers(): Promise<AuthenticatedUsersResponse> {
        try {
            console.log('🟢 AdminService: Récupération utilisateurs connectés...');
            return await apiClient.get<AuthenticatedUsersResponse>('/api/users/authenticated');
        } catch (error) {
            console.error('❌ AdminService: Erreur récupération utilisateurs connectés:', error);
            throw error;
        }
    }

    // ===================================================================
    // GESTION DES ADMINISTRATEURS
    // ===================================================================

    /**
     * Récupère la liste de tous les administrateurs
     */
    async getAllAdmins(): Promise<AdminListResponse> {
        try {
            console.log('👥 AdminService: Récupération liste admins...');
            return await apiClient.get<AdminListResponse>('/api/admin/list');
        } catch (error) {
            console.error('❌ AdminService: Erreur récupération admins:', error);
            throw error;
        }
    }

    /**
     * Promeut un utilisateur au rang d'administrateur
     */
    async promoteToAdmin(request: PromoteRequest): Promise<PromoteResponse> {
        try {
            console.log('⬆️ AdminService: Promotion utilisateur:', request.bet_login);
            return await apiClient.post<PromoteResponse>('/api/admin/promote', request);
        } catch (error) {
            console.error('❌ AdminService: Erreur promotion:', error);
            throw error;
        }
    }

    /**
     * Rétrograde un administrateur au rang d'utilisateur
     */
    async demoteFromAdmin(request: DemoteRequest): Promise<DemoteResponse> {
        try {
            console.log('⬇️ AdminService: Rétrogradation admin:', request.bet_login);
            return await apiClient.post<DemoteResponse>('/api/admin/demote', request);
        } catch (error) {
            console.error('❌ AdminService: Erreur rétrogradation:', error);
            throw error;
        }
    }

    // ===================================================================
    // STATISTIQUES ET MONITORING
    // ===================================================================

    /**
     * Récupère le statut général du système
     */
    async getSystemStatus(): Promise<SystemStatus> {
        try {
            console.log('📊 AdminService: Récupération statut système...');
            return await apiClient.get<SystemStatus>('/api/status');
        } catch (error) {
            console.error('❌ AdminService: Erreur statut système:', error);
            throw error;
        }
    }

    // ===================================================================
    // MÉTHODES UTILITAIRES
    // ===================================================================

    /**
     * Vérifie si l'utilisateur connecté est administrateur
     */
    async isCurrentUserAdmin(): Promise<boolean> {
        try {
            const myRole = await this.getMyRole();
            return myRole.is_admin;
        } catch (error) {
            console.error('❌ AdminService: Erreur vérification admin:', error);
            return false;
        }
    }

    /**
     * Vérifie si l'utilisateur connecté est super-administrateur
     */
    async isCurrentUserSuperAdmin(): Promise<boolean> {
        try {
            const myRole = await this.getMyRole();
            return myRole.is_super_admin;
        } catch (error) {
            console.error('❌ AdminService: Erreur vérification super-admin:', error);
            return false;
        }
    }

    /**
     * Recherche des utilisateurs par critères
     */
    async searchUsers(query: string, role?: string): Promise<UsersListResponse> {
        try {
            const allUsers = await this.getAllUsers();

            // Filtrage côté client (simple)
            let filteredUsers = allUsers.users;

            // Filtre par texte de recherche
            if (query.trim()) {
                const searchQuery = query.toLowerCase();
                filteredUsers = filteredUsers.filter(user =>
                    user.bet_login.toString().includes(searchQuery)
                );
            }

            // Filtre par rôle
            if (role && role !== 'all') {
                filteredUsers = filteredUsers.filter(user => user.role === role);
            }

            return {
                total_users: filteredUsers.length,
                users: filteredUsers
            };
        } catch (error) {
            console.error('❌ AdminService: Erreur recherche utilisateurs:', error);
            throw error;
        }
    }

    /**
     * Valide les permissions pour une action admin
     */
    async canPerformAction(action: 'promote' | 'demote', targetUser: string): Promise<boolean> {
        try {
            const [myRole, targetRole] = await Promise.all([
                this.getMyRole(),
                this.getUserRole(targetUser)
            ]);

            // Super-admin peut tout faire (sauf se rétrograder)
            if (myRole.is_super_admin) {
                if (action === 'demote' && targetUser === myRole.user) {
                    return false; // Super-admin ne peut pas se rétrograder
                }
                return true;
            }

            // Admin normal ne peut pas modifier d'autres admins
            if (myRole.is_admin && targetRole.is_admin) {
                return false;
            }

            // Admin normal peut promouvoir/rétrograder des utilisateurs normaux
            if (myRole.is_admin && !targetRole.is_admin) {
                return true;
            }

            // Utilisateur normal ne peut rien faire
            return false;
        } catch (error) {
            console.error('❌ AdminService: Erreur validation permissions:', error);
            return false;
        }
    }
}

export const adminService = new AdminService();