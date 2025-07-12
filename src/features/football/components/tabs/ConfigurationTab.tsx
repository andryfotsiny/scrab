// ConfigurationTab.tsx - VERSION RESPONSIVE
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    RefreshControl,
    Keyboard,
    Dimensions,
} from 'react-native';
import { useTheme } from '@/src/shared/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useFootball } from '@/src/features/football/context/FootballContext';
import { useGroloConfig, useUpdateGroloConfig, useGroloUtils } from '@/src/shared/hooks/grolo/useGroloQueries';
import { useAdminPermissions } from '@/src/shared/hooks/admin/useAdminQueries';
import { ConfigUpdateRequest } from '../../../../shared/services/types/grolo.type';

import Button from '@/src/components/atoms/Button';
import Input from '@/src/components/atoms/Input';
import Text from '@/src/components/atoms/Text';
import Skeleton from '@/src/components/atoms/Skeleton';
import ConfirmationModal from '@/src/components/molecules/ConfirmationModal';
import { spacing } from '@/src/styles';

// Hook pour la responsivité
const useScreenSize = () => {
    const [screenSize, setScreenSize] = useState(() => {
        const { width } = Dimensions.get('window');
        return {
            width,
            isTablet: width >= 768,
            isDesktop: width >= 1024,
            isMobile: width < 768,
        };
    });

    useEffect(() => {
        const subscription = Dimensions.addEventListener('change', ({ window }) => {
            setScreenSize({
                width: window.width,
                isTablet: window.width >= 768,
                isDesktop: window.width >= 1024,
                isMobile: window.width < 768,
            });
        });

        return () => subscription?.remove();
    }, []);

    return screenSize;
};

export default function ConfigurationTab() {
    const { colors } = useTheme();
    const screenSize = useScreenSize();

    // React Query hooks + vérification admin
    const { data: config, isLoading: configLoading, error: configError } = useGroloConfig();
    const updateConfigMutation = useUpdateGroloConfig();
    const { refreshConfig } = useGroloUtils();
    const adminPermissions = useAdminPermissions();
    const {
        loading: contextLoading,
        error: contextError,
    } = useFootball();

    // Debug permissions
    useEffect(() => {
        console.log('🔐 ConfigurationTab permissions:', {
            isAdmin: adminPermissions.isAdmin,
            isSuperAdmin: adminPermissions.isSuperAdmin,
            canEditConfig: adminPermissions.isAdmin || adminPermissions.isSuperAdmin,
            isLoading: adminPermissions.isLoading
        });
    }, [adminPermissions]);

    // Dérivation des permissions
    const isAdmin = adminPermissions.isAdmin;
    const isSuperAdmin = adminPermissions.isSuperAdmin;
    const canEditConfig = isAdmin || isSuperAdmin;

    // États de chargement dérivés
    const loading = configLoading || contextLoading || updateConfigMutation.isPending || adminPermissions.isLoading;
    const error = configError?.message || contextError;
    const initialLoading = (configLoading && !config) || adminPermissions.isLoading;

    // Form state - adapté selon les permissions
    const [formData, setFormData] = useState<ConfigUpdateRequest>({});
    const [hasChanges, setHasChanges] = useState(false);
    const [lastUpdateTime, setLastUpdateTime] = useState<string | null>(null);

    // Modal states
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [modalData, setModalData] = useState({
        title: '',
        message: '',
        confirmText: '',
        onConfirm: () => {},
    });

    useEffect(() => {
        if (config) {
            // Pour les utilisateurs normaux, seulement default_stake
            const initialData = canEditConfig ? {
                min_odds: config.constraints.min_odds,
                max_odds: config.constraints.max_odds,
                max_matches: config.constraints.max_matches,
                max_total_odds: config.constraints.max_total_odds,
                default_stake: config.settings.default_stake,
            } : {
                default_stake: config.settings.default_stake,
            };

            setFormData(initialData);
            setHasChanges(false);
        }
    }, [config, canEditConfig]);

    // React Query gère automatiquement le refresh
    const onRefresh = useCallback(async () => {
        try {
            await refreshConfig();
            console.log('🔄 ConfigurationTab: Config refreshed via React Query');
        } catch (err) {
            console.error('Refresh error:', err);
        }
    }, [refreshConfig]);

    const handleInputChange = (field: keyof ConfigUpdateRequest, value: string) => {
        const numericValue = parseFloat(value) || 0;
        const newFormData = { ...formData, [field]: numericValue };
        setFormData(newFormData);

        // Check if there are changes
        if (config) {
            let hasFieldChanges = false;

            if (canEditConfig) {
                hasFieldChanges =
                    newFormData.min_odds !== config.constraints.min_odds ||
                    newFormData.max_odds !== config.constraints.max_odds ||
                    newFormData.max_matches !== config.constraints.max_matches ||
                    newFormData.max_total_odds !== config.constraints.max_total_odds ||
                    newFormData.default_stake !== config.settings.default_stake;
            } else {
                // Pour les utilisateurs normaux, seulement default_stake
                hasFieldChanges = newFormData.default_stake !== config.settings.default_stake;
            }

            setHasChanges(hasFieldChanges);
        }
    };

    const validateForm = (): string | null => {
        // Validation default_stake (toujours nécessaire)
        if (!formData.default_stake || formData.default_stake < 100 || formData.default_stake > 100000) {
            return 'La mise par défaut doit être entre 100 et 100 000 MGA';
        }

        // Validations admin seulement
        if (canEditConfig) {
            if (!formData.min_odds || formData.min_odds < 1 || formData.min_odds > 3) {
                return 'La cote minimale doit être entre 1 et 3';
            }

            if (!formData.max_odds || formData.max_odds < 1 || formData.max_odds > 5) {
                return 'La cote maximale doit être entre 1 et 5';
            }

            if (formData.min_odds >= formData.max_odds) {
                return 'La cote minimale doit être inférieure à la cote maximale';
            }

            if (!formData.max_matches || formData.max_matches < 1 || formData.max_matches > 50) {
                return 'Le nombre maximum de matchs doit être entre 1 et 50';
            }

            if (!formData.max_total_odds || formData.max_total_odds < 1000 || formData.max_total_odds > 100000) {
                return 'La cote totale maximum doit être entre 1 000 et 100 000';
            }
        }

        return null;
    };

    const handleSave = async () => {
        console.log('🚀 handleSave called with formData:', formData);
        Keyboard.dismiss();

        const validationError = validateForm();
        if (validationError) {
            console.log('❌ Validation error:', validationError);
            setModalData({
                title: 'Erreur de validation',
                message: validationError,
                confirmText: 'Compris',
                onConfirm: () => setShowErrorModal(false),
            });
            setShowErrorModal(true);
            return;
        }

        const actionText = canEditConfig ? 'sauvegarder ces modifications' : 'modifier votre mise par défaut';
        setModalData({
            title: 'Confirmer les modifications',
            message: `Êtes-vous sûr de vouloir ${actionText} ?`,
            confirmText: 'Sauvegarder',
            onConfirm: handleConfirmSave,
        });
        setShowConfirmModal(true);
    };

    const handleConfirmSave = async () => {
        console.log('✅ User confirmed save, calling updateConfig...');
        setShowConfirmModal(false);

        try {
            const result = await updateConfigMutation.mutateAsync(formData);
            console.log('🎉 Config update successful:', result);

            if (result.metadata && result.metadata.updated_at) {
                setLastUpdateTime(result.metadata.updated_at);
            }

            const successMessage = canEditConfig
                ? `Modifications sauvegardées avec succès !\n\nChangements:\n${result.changes_made.join('\n')}`
                : `Mise par défaut mise à jour avec succès !\n\nNouvelle valeur: ${result.new_config.settings.default_stake} MGA`;

            setModalData({
                title: 'Configuration mise à jour',
                message: successMessage,
                confirmText: 'Parfait !',
                onConfirm: () => setShowSuccessModal(false),
            });
            setShowSuccessModal(true);
            setHasChanges(false);
        } catch (err) {
            console.log('💥 Config update failed:', err);
            setModalData({
                title: 'Erreur',
                message: error || 'Erreur lors de la sauvegarde',
                confirmText: 'Compris',
                onConfirm: () => setShowErrorModal(false),
            });
            setShowErrorModal(true);
        }
    };

    const handleReset = () => {
        Keyboard.dismiss();

        if (config) {
            const resetData = canEditConfig ? {
                min_odds: config.constraints.min_odds,
                max_odds: config.constraints.max_odds,
                max_matches: config.constraints.max_matches,
                max_total_odds: config.constraints.max_total_odds,
                default_stake: config.settings.default_stake,
            } : {
                default_stake: config.settings.default_stake,
            };

            setFormData(resetData);
            setHasChanges(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('mg-MG', {
            style: 'currency',
            currency: 'MGA',
        }).format(amount);
    };

    // Rendu de la configuration actuelle
    const renderCurrentConfigSection = () => (
        config && (
            <View style={[
                styles.configSection,
                screenSize.isDesktop && styles.desktopConfigSection
            ]}>
                <Text
                    variant={screenSize.isDesktop ? "heading2" : "heading3"}
                    color="text"
                >
                    Configuration Actuelle
                </Text>

                <View style={[
                    styles.currentConfigGrid,
                    screenSize.isDesktop && styles.desktopCurrentConfigGrid
                ]}>
                    <View style={[styles.configItem, screenSize.isDesktop && styles.desktopConfigItem]}>
                        <Text variant="caption" color="textSecondary">
                            Cotes
                        </Text>
                        <Text
                            variant={screenSize.isDesktop ? "heading3" : "body"}
                            weight="bold"
                            color="text"
                        >
                            {config.constraints.min_odds} - {config.constraints.max_odds}
                        </Text>
                    </View>

                    {canEditConfig && (
                        <>
                            <View style={[styles.configItem, screenSize.isDesktop && styles.desktopConfigItem]}>
                                <Text variant="caption" color="textSecondary">
                                    Max Matchs
                                </Text>
                                <Text
                                    variant={screenSize.isDesktop ? "heading3" : "body"}
                                    weight="bold"
                                    color="text"
                                >
                                    {config.constraints.max_matches}
                                </Text>
                            </View>

                            <View style={[styles.configItem, screenSize.isDesktop && styles.desktopConfigItem]}>
                                <Text variant="caption" color="textSecondary">
                                    Cote totale max
                                </Text>
                                <Text
                                    variant={screenSize.isDesktop ? "heading3" : "body"}
                                    weight="bold"
                                    color="text"
                                >
                                    {config.constraints.max_total_odds.toLocaleString()}
                                </Text>
                            </View>
                        </>
                    )}

                    <View style={[styles.configItem, screenSize.isDesktop && styles.desktopConfigItem]}>
                        <Text variant="caption" color="textSecondary">
                            Mise par défaut
                        </Text>
                        <Text
                            variant={screenSize.isDesktop ? "heading3" : "body"}
                            weight="bold"
                            color="primary"
                        >
                            {formatCurrency(config.settings.default_stake)}
                        </Text>
                    </View>
                </View>

                <View style={styles.metadataContainer}>
                    <Text variant="caption" color="textSecondary">
                        Dernière mise à jour: {lastUpdateTime
                        ? new Date(lastUpdateTime).toLocaleString('fr-FR')
                        : (config.metadata?.updated_at
                                ? new Date(config.metadata.updated_at).toLocaleString('fr-FR')
                                : 'Information non disponible'
                        )
                    }
                    </Text>
                </View>
            </View>
        )
    );

    // Rendu du formulaire de configuration
    const renderConfigFormSection = () => (
        <View style={[
            styles.section,
            screenSize.isDesktop && styles.desktopSection
        ]}>
            <Text
                variant={screenSize.isDesktop ? "heading2" : "heading3"}
                color="text"
            >
                {canEditConfig ? 'Modifier la Configuration' : 'Paramètres Personnels'}
            </Text>

            {screenSize.isDesktop && canEditConfig ? (
                // Layout desktop en colonnes pour admin
                <View style={styles.desktopFormLayout}>
                    <View style={styles.desktopFormColumn}>
                        {/* Cotes Section */}
                        <View style={[styles.formSection, styles.desktopFormCard]}>
                            <Text variant="body" weight="bold" color="text">
                                Contraintes de Cotes
                            </Text>

                            <Input
                                label="Cote minimale"
                                value={formData.min_odds?.toString() || ''}
                                onChangeText={(value) => handleInputChange('min_odds', value)}
                                keyboardType="decimal-pad"
                                placeholder="1.2"
                                helperText="Entre 1.0 et 3.0"
                                returnKeyType="done"
                                onSubmitEditing={Keyboard.dismiss}
                            />

                            <Input
                                label="Cote maximale"
                                value={formData.max_odds?.toString() || ''}
                                onChangeText={(value) => handleInputChange('max_odds', value)}
                                keyboardType="decimal-pad"
                                placeholder="1.5"
                                helperText="Entre 1.0 et 5.0"
                                returnKeyType="done"
                                onSubmitEditing={Keyboard.dismiss}
                            />
                        </View>
                    </View>

                    <View style={styles.desktopFormColumn}>
                        {/* Limites Section */}
                        <View style={[styles.formSection, styles.desktopFormCard]}>
                            <Text variant="body" weight="bold" color="text">
                                Limites
                            </Text>

                            <Input
                                label="Nombre maximum de matchs"
                                value={formData.max_matches?.toString() || ''}
                                onChangeText={(value) => handleInputChange('max_matches', value)}
                                keyboardType="numeric"
                                placeholder="40"
                                helperText="Entre 1 et 50 matchs"
                                returnKeyType="done"
                                onSubmitEditing={Keyboard.dismiss}
                            />

                            <Input
                                label="Cote totale maximum"
                                value={formData.max_total_odds?.toString() || ''}
                                onChangeText={(value) => handleInputChange('max_total_odds', value)}
                                keyboardType="numeric"
                                placeholder="70000"
                                helperText="Entre 1 000 et 100 000"
                                returnKeyType="done"
                                onSubmitEditing={Keyboard.dismiss}
                            />
                        </View>
                    </View>
                </View>
            ) : (
                // Layout mobile ou utilisateur normal
                <>
                    {/* Cotes Section - Admin mobile seulement */}
                    {canEditConfig && (
                        <View style={styles.formSection}>
                            <Text variant="body" weight="bold" color="text">
                                Contraintes de Cotes
                            </Text>

                            <Input
                                label="Cote minimale"
                                value={formData.min_odds?.toString() || ''}
                                onChangeText={(value) => handleInputChange('min_odds', value)}
                                keyboardType="decimal-pad"
                                placeholder="1.2"
                                helperText="Entre 1.0 et 3.0"
                                returnKeyType="done"
                                onSubmitEditing={Keyboard.dismiss}
                            />

                            <Input
                                label="Cote maximale"
                                value={formData.max_odds?.toString() || ''}
                                onChangeText={(value) => handleInputChange('max_odds', value)}
                                keyboardType="decimal-pad"
                                placeholder="1.5"
                                helperText="Entre 1.0 et 5.0"
                                returnKeyType="done"
                                onSubmitEditing={Keyboard.dismiss}
                            />
                        </View>
                    )}

                    {/* Limits Section - Admin mobile seulement */}
                    {canEditConfig && (
                        <View style={styles.formSection}>
                            <Text variant="body" weight="bold" color="text">
                                Limites
                            </Text>

                            <Input
                                label="Nombre maximum de matchs"
                                value={formData.max_matches?.toString() || ''}
                                onChangeText={(value) => handleInputChange('max_matches', value)}
                                keyboardType="numeric"
                                placeholder="40"
                                helperText="Entre 1 et 50 matchs"
                                returnKeyType="done"
                                onSubmitEditing={Keyboard.dismiss}
                            />

                            <Input
                                label="Cote totale maximum"
                                value={formData.max_total_odds?.toString() || ''}
                                onChangeText={(value) => handleInputChange('max_total_odds', value)}
                                keyboardType="numeric"
                                placeholder="70000"
                                helperText="Entre 1 000 et 100 000"
                                returnKeyType="done"
                                onSubmitEditing={Keyboard.dismiss}
                            />
                        </View>
                    )}
                </>
            )}

            {/* Settings Section - Toujours visible */}
            <View style={[
                styles.formSection,
                screenSize.isDesktop && styles.desktopFormCard
            ]}>
                <Text variant="body" weight="bold" color="text">
                    Paramètres
                </Text>

                <Input
                    label="Mise par défaut (MGA)"
                    value={formData.default_stake?.toString() || ''}
                    onChangeText={(value) => handleInputChange('default_stake', value)}
                    keyboardType="numeric"
                    placeholder="400"
                    helperText="Entre 100 et 100 000 MGA"
                    returnKeyType="done"
                    onSubmitEditing={Keyboard.dismiss}
                    required
                />
            </View>

            {/* Action Buttons */}
            <View style={[
                styles.actionButtons,
                screenSize.isDesktop && styles.desktopActionButtons
            ]}>
                <Button
                    title="Réinitialiser"
                    onPress={handleReset}
                    variant="outline"
                    size={screenSize.isDesktop ? "md" : "sm"}
                    disabled={!hasChanges || loading}
                    style={screenSize.isDesktop ? { minWidth: 150 } : { flex: 1 }}
                />

                <Button
                    title={loading ? 'Sauvegarde...' : 'Sauvegarder'}
                    onPress={handleSave}
                    variant="outline"
                    size={screenSize.isDesktop ? "md" : "sm"}
                    disabled={!hasChanges || loading}
                    loading={loading}
                    style={{
                        borderColor: hasChanges ? colors.success : colors.textSecondary,
                        ...(screenSize.isDesktop ? { minWidth: 150 } : { flex: 1 })
                    }}
                    textStyle={{
                        color: hasChanges ? colors.success : colors.textSecondary,
                    }}
                />
            </View>
        </View>
    );

    // Rendu des informations
    const renderInformationSection = () => (
        canEditConfig && (
            <View style={[
                styles.section,
                screenSize.isDesktop && styles.desktopSection
            ]}>
                <Text
                    variant={screenSize.isDesktop ? "heading2" : "heading3"}
                    color="text"
                >
                    Informations importantes
                </Text>

                <View style={[
                    styles.infoList,
                    screenSize.isDesktop && styles.desktopInfoList
                ]}>
                    <View style={[styles.infoItem, screenSize.isDesktop && styles.desktopInfoItem]}>
                        <Ionicons name="warning-outline" size={16} color={colors.warning} />
                        <Text variant="caption" color="textSecondary" style={styles.infoText}>
                            Les modifications prendront effet immédiatement après la sauvegarde
                        </Text>
                    </View>

                    <View style={[styles.infoItem, screenSize.isDesktop && styles.desktopInfoItem]}>
                        <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
                        <Text variant="caption" color="textSecondary" style={styles.infoText}>
                            La cote minimale doit toujours être inférieure à la cote maximale
                        </Text>
                    </View>

                    <View style={[styles.infoItem, screenSize.isDesktop && styles.desktopInfoItem]}>
                        <Ionicons name="shield-checkmark-outline" size={16} color={colors.success} />
                        <Text variant="caption" color="textSecondary" style={styles.infoText}>
                            Les paris automatiques respecteront ces nouvelles contraintes
                        </Text>
                    </View>
                </View>
            </View>
        )
    );

    const renderSkeletonContent = () => (
        <View style={[
            styles.content,
            screenSize.isDesktop && styles.desktopContent
        ]}>
            {/* Configuration Actuelle Skeleton */}
            <View style={[
                styles.configSection,
                screenSize.isDesktop && styles.desktopConfigSection
            ]}>
                <Text
                    variant={screenSize.isDesktop ? "heading2" : "heading3"}
                    color="text"
                >
                    Configuration Actuelle
                </Text>

                <View style={styles.currentConfigGrid}>
                    {canEditConfig && (
                        <>
                            <View style={styles.configItem}>
                                <Text variant="caption" color="textSecondary">Cotes</Text>
                                <Skeleton width="60%" height={18} animated={false} />
                            </View>
                            <View style={styles.configItem}>
                                <Text variant="caption" color="textSecondary">Max Matchs</Text>
                                <Skeleton width="30%" height={18} animated={false} />
                            </View>
                            <View style={styles.configItem}>
                                <Text variant="caption" color="textSecondary">Cote totale max</Text>
                                <Skeleton width="45%" height={18} animated={false} />
                            </View>
                        </>
                    )}
                    <View style={styles.configItem}>
                        <Text variant="caption" color="textSecondary">Mise par défaut</Text>
                        <Skeleton width="75%" height={18} animated={false} />
                    </View>
                </View>

                <View style={styles.metadataContainer}>
                    <Text variant="caption" color="textSecondary">Dernière mise à jour:</Text>
                    <Skeleton width="60%" height={14} animated={false} />
                </View>
            </View>
        </View>
    );

    const renderContent = () => (
        <View style={[
            styles.content,
            screenSize.isDesktop && styles.desktopContent
        ]}>
            {screenSize.isDesktop ? (
                // Layout desktop avec colonnes
                <View style={styles.desktopLayout}>
                    <View style={styles.desktopLeftColumn}>
                        {renderCurrentConfigSection()}
                        {renderConfigFormSection()}
                    </View>
                    <View style={styles.desktopRightColumn}>
                        {renderInformationSection()}
                    </View>
                </View>
            ) : (
                // Layout mobile/tablette
                <>
                    {renderCurrentConfigSection()}
                    <View style={[styles.separator, { backgroundColor: colors.border }]} />
                    {renderConfigFormSection()}
                    {canEditConfig && (
                        <>
                            <View style={[styles.separator, { backgroundColor: colors.border }]} />
                            {renderInformationSection()}
                        </>
                    )}
                </>
            )}
        </View>
    );

    return (
        <>
            <ScrollView
                style={styles.container}
                contentContainerStyle={{ paddingBottom: 50 }}
                refreshControl={
                    <RefreshControl
                        refreshing={loading && !!config}
                        onRefresh={onRefresh}
                        tintColor={colors.primary}
                        colors={[colors.primary]}
                    />
                }
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {initialLoading ? renderSkeletonContent() : renderContent()}
            </ScrollView>

            {/* Modals */}
            <ConfirmationModal
                visible={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                title={modalData.title}
                message={modalData.message}
                confirmText={modalData.confirmText}
                onConfirm={modalData.onConfirm}
                type="warning"
                loading={loading}
            />

            <ConfirmationModal
                visible={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                title={modalData.title}
                message={modalData.message}
                confirmText={modalData.confirmText}
                onConfirm={modalData.onConfirm}
                type="success"
            />

            <ConfirmationModal
                visible={showErrorModal}
                onClose={() => setShowErrorModal(false)}
                title={modalData.title}
                message={modalData.message}
                confirmText={modalData.confirmText}
                onConfirm={modalData.onConfirm}
                type="error"
            />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: spacing.lg,
        paddingTop: spacing.xs,
    },

    // Styles communs
    configSection: {
        paddingBottom: spacing.lg,
    },
    section: {
        paddingVertical: spacing.lg,
    },
    separator: {
        height: 1,
        marginVertical: spacing.xs,
    },
    currentConfigGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
        marginBottom: spacing.md,
    },
    configItem: {
        flex: 1,
        minWidth: '45%',
    },
    metadataContainer: {
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.1)',
    },
    formSection: {
        marginBottom: spacing.lg,
    },
    actionButtons: {
        flexDirection: 'column-reverse',
        gap: spacing.sm,
        marginTop: spacing.xs,
    },
    infoList: {
        gap: spacing.sm,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.xs,
    },
    infoText: {
        flex: 1,
        lineHeight: 20,
    },

    // Styles desktop
    desktopContent: {
        padding: spacing.xl,
        maxWidth: 1400,
        alignSelf: 'center',
        width: '100%',
    },

    desktopLayout: {
        flexDirection: 'row',
        gap: spacing.xl * 2,
    },

    desktopLeftColumn: {
        flex: 2,
        gap: spacing.xl,
    },

    desktopRightColumn: {
        flex: 1,
        gap: spacing.xl,
    },

    desktopConfigSection: {
        padding: spacing.xl,
        backgroundColor: 'rgba(0,0,0,0.02)',
        borderRadius: 16,
    },

    desktopCurrentConfigGrid: {
        gap: spacing.xl,
    },

    desktopConfigItem: {
        minWidth: 200,
        padding: spacing.lg,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },

    desktopSection: {
        padding: spacing.xl,
        backgroundColor: 'rgba(0,0,0,0.02)',
        borderRadius: 16,
    },

    desktopFormLayout: {
        flexDirection: 'row',
        gap: spacing.xl,
    },

    desktopFormColumn: {
        flex: 1,
    },

    desktopFormCard: {
        padding: spacing.xl,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },

    desktopActionButtons: {
        flexDirection: 'row',
        gap: spacing.lg,
        justifyContent: 'flex-end',
        marginTop: spacing.lg,
    },

    desktopInfoList: {
        gap: spacing.md,
    },

    desktopInfoItem: {
        padding: spacing.md,
        backgroundColor: '#ffffff',
        borderRadius: 8,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
});