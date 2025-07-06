// MiniConfigurationTab.tsx - Refactorisé avec les composants réutilisables et Skeleton
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    Alert,
    RefreshControl,
    Keyboard,
} from 'react-native';
import { useTheme } from '@/src/shared/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useMini } from '@/src/features/football/hooks/useMini';
import { MiniConfigUpdateRequest } from '@/src/features/football/types/mini';

// Import des composants réutilisables
import Button from '@/src/components/atoms/Button';
import Input from '@/src/components/atoms/Input';
import Text from '@/src/components/atoms/Text';
import Skeleton from '@/src/components/atoms/Skeleton';
import { spacing } from '@/src/styles';

export default function MiniConfigurationTab() {
    const { colors } = useTheme();
    const {
        loading,
        config,
        error,
        loadConfig,
        updateConfig,
    } = useMini();

    // Form state
    const [formData, setFormData] = useState<MiniConfigUpdateRequest>({});
    const [hasChanges, setHasChanges] = useState(false);
    const [lastUpdateTime, setLastUpdateTime] = useState<string | null>(null);
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        const initializeData = async () => {
            try {
                await loadConfig();
            } catch (err) {
                console.error('Initialize error:', err);
            } finally {
                setInitialLoading(false);
            }
        };

        initializeData();
    }, [loadConfig]);

    useEffect(() => {
        if (config) {
            const initialData = {
                min_odds: config.constraints.min_odds,
                max_odds: config.constraints.max_odds,
                max_total_odds: config.constraints.max_total_odds,
                default_stake: config.settings.default_stake,
            };
            setFormData(initialData);
            setHasChanges(false);
        }
    }, [config]);

    const onRefresh = useCallback(async () => {
        try {
            await loadConfig();
        } catch (err) {
            console.error('Refresh error:', err);
        }
    }, [loadConfig]);

    const handleInputChange = (field: keyof MiniConfigUpdateRequest, value: string) => {
        const numericValue = parseFloat(value) || 0;
        const newFormData = { ...formData, [field]: numericValue };
        setFormData(newFormData);

        // Check if there are changes
        if (config) {
            const hasFieldChanges =
                newFormData.min_odds !== config.constraints.min_odds ||
                newFormData.max_odds !== config.constraints.max_odds ||
                newFormData.max_total_odds !== config.constraints.max_total_odds ||
                newFormData.default_stake !== config.settings.default_stake;

            setHasChanges(hasFieldChanges);
        }
    };

    const validateForm = (): string | null => {
        if (!formData.min_odds || formData.min_odds < 1 || formData.min_odds > 3) {
            return 'La cote minimale doit être entre 1 et 3';
        }

        if (!formData.max_odds || formData.max_odds < 1 || formData.max_odds > 5) {
            return 'La cote maximale doit être entre 1 et 5';
        }

        if (formData.min_odds >= formData.max_odds) {
            return 'La cote minimale doit être inférieure à la cote maximale';
        }

        if (!formData.max_total_odds || formData.max_total_odds < 1000 || formData.max_total_odds > 10000) {
            return 'La cote totale maximum doit être entre 1 000 et 10 000';
        }

        if (!formData.default_stake || formData.default_stake < 100 || formData.default_stake > 100000) {
            return 'La mise par défaut doit être entre 100 et 100 000 MGA';
        }

        return null;
    };

    const handleSave = async () => {
        console.log('🚀 Mini handleSave called with formData:', formData);

        // Fermer le clavier d'abord
        Keyboard.dismiss();

        const validationError = validateForm();
        if (validationError) {
            console.log('❌ Mini validation error:', validationError);
            Alert.alert('Erreur de validation', validationError);
            return;
        }

        Alert.alert(
            'Confirmer les modifications',
            'Êtes-vous sûr de vouloir sauvegarder ces modifications pour le système Mini ?',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Sauvegarder',
                    onPress: async () => {
                        console.log('✅ Mini user confirmed save, calling updateConfig...');
                        try {
                            const result = await updateConfig(formData);
                            console.log('🎉 Mini config update successful:', result);

                            // Mettre à jour le temps de dernière modification
                            if (result.metadata && result.metadata.updated_at) {
                                setLastUpdateTime(result.metadata.updated_at);
                            }

                            Alert.alert(
                                'Configuration Mini mise à jour',
                                `Modifications sauvegardées avec succès !\n\nChangements:\n${result.changes_made.join('\n')}`
                            );
                            setHasChanges(false);
                        } catch (err) {
                            console.log('💥 Mini config update failed:', err);
                            Alert.alert('Erreur', error || 'Erreur lors de la sauvegarde');
                        }
                    },
                },
            ]
        );
    };

    const handleReset = () => {
        // Fermer le clavier d'abord
        Keyboard.dismiss();

        if (config) {
            setFormData({
                min_odds: config.constraints.min_odds,
                max_odds: config.constraints.max_odds,
                max_total_odds: config.constraints.max_total_odds,
                default_stake: config.settings.default_stake,
            });
            setHasChanges(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('mg-MG', {
            style: 'currency',
            currency: 'MGA',
        }).format(amount);
    };

    const renderSkeletonContent = () => (
        <>
            {/* Current Configuration Display Skeleton - SEULEMENT données API */}
            <View style={styles.firstSection}>
                <Text variant="heading3" color="text">
                    Configuration Mini Actuelle
                </Text>

                <View style={styles.currentConfigGrid}>
                    <View style={styles.configItem}>
                        <Text variant="caption" color="textSecondary">
                            Cotes
                        </Text>
                        <Skeleton width="60%" height={18} animated={false} />
                    </View>

                    <View style={styles.configItem}>
                        <Text variant="caption" color="textSecondary">
                            Système
                        </Text>
                        <Skeleton width="40%" height={18} animated={false} />
                    </View>

                    <View style={styles.configItem}>
                        <Text variant="caption" color="textSecondary">
                            Cote totale max
                        </Text>
                        <Skeleton width="50%" height={18} animated={false} />
                    </View>

                    <View style={styles.configItem}>
                        <Text variant="caption" color="textSecondary">
                            Mise par défaut
                        </Text>
                        <Skeleton width="75%" height={18} animated={false} />
                    </View>
                </View>

                <View style={styles.systemTypeContainer}>
                    <Text variant="caption" color="textSecondary">
                        Type de système:
                    </Text>
                    <Skeleton width="40%" height={14} animated={false} />
                    <Text variant="caption" color="textSecondary">
                        Dernière mise à jour:
                    </Text>
                    <Skeleton width="60%" height={14} animated={false} />
                </View>
            </View>

            {/* Ligne de séparation */}
            <View style={[styles.separator, { backgroundColor: colors.border }]} />

            {/* Configuration Form - Inputs vides mais visibles */}
            <View style={styles.section}>
                <Text variant="heading3" color="text">
                    Modifier la Configuration Mini
                </Text>

                {/* Cotes Section */}
                <View style={styles.formSection}>
                    <Text variant="body" weight="bold" color="text">
                        Contraintes de Cotes Mini
                    </Text>

                    <Input
                        label="Cote minimale"
                        value=""
                        onChangeText={() => {}}
                        keyboardType="decimal-pad"
                        placeholder="1.1"
                        helperText="Entre 1.0 et 3.0"
                        editable={false}
                    />

                    <Input
                        label="Cote maximale"
                        value=""
                        onChangeText={() => {}}
                        keyboardType="decimal-pad"
                        placeholder="1.5"
                        helperText="Entre 1.0 et 5.0"
                        editable={false}
                    />
                </View>

                {/* Limits Section */}
                <View style={styles.formSection}>
                    <Text variant="body" weight="bold" color="text">
                        Limites Mini
                    </Text>

                    <Input
                        label="Cote totale maximum"
                        value=""
                        onChangeText={() => {}}
                        keyboardType="numeric"
                        placeholder="10000"
                        helperText="Entre 1 000 et 10 000 (spécifique au Mini)"
                        editable={false}
                    />
                </View>

                {/* Settings Section */}
                <View style={styles.formSection}>
                    <Text variant="body" weight="bold" color="text">
                        Paramètres Mini
                    </Text>

                    <Input
                        label="Mise par défaut (MGA)"
                        value=""
                        onChangeText={() => {}}
                        keyboardType="numeric"
                        placeholder="200"
                        helperText="Entre 100 et 100 000 MGA"
                        editable={false}
                        required
                    />
                </View>

                {/* Action Buttons - Désactivés */}
                <View style={styles.actionButtons}>
                    <Button
                        title="Réinitialiser"
                        onPress={() => {}}
                        variant="outline"
                        disabled={true}
                        style={{ flex: 1 }}
                    />

                    <Button
                        title="Sauvegarder"
                        onPress={() => {}}
                        variant="outline"
                        disabled={true}
                        style={{ flex: 1 }}
                    />
                </View>
            </View>

            {/* Ligne de séparation */}
            <View style={[styles.separator, { backgroundColor: colors.border }]} />

            {/* Information Section - Textes statiques, PAS de skeleton */}
            <View style={styles.section}>
                <Text variant="heading3" color="text">
                    Informations Mini
                </Text>

                <View style={styles.infoList}>
                    <View style={styles.infoItem}>
                        <Ionicons name="flash-outline" size={16} color={colors.primary} />
                        <Text variant="caption" color="textSecondary" style={styles.infoText}>
                            Le système Mini est optimisé pour exactement 2 matchs avec des cotes modérées
                        </Text>
                    </View>

                    <View style={styles.infoItem}>
                        <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
                        <Text variant="caption" color="textSecondary" style={styles.infoText}>
                            Les limites de cotes totales sont plus basses pour réduire les risques
                        </Text>
                    </View>

                    <View style={styles.infoItem}>
                        <Ionicons name="shield-checkmark-outline" size={16} color={colors.success} />
                        <Text variant="caption" color="textSecondary" style={styles.infoText}>
                            Système idéal pour des gains réguliers avec une mise plus sûre
                        </Text>
                    </View>
                </View>
            </View>
        </>
    );

    const renderContent = () => (
        <>
            {/* Current Configuration Display */}
            {config && (
                <View style={styles.firstSection}>
                    <Text variant="heading3" color="text">
                        Configuration Mini Actuelle
                    </Text>

                    <View style={styles.currentConfigGrid}>
                        <View style={styles.configItem}>
                            <Text variant="caption" color="textSecondary">
                                Cotes
                            </Text>
                            <Text variant="body" weight="bold" color="text">
                                {config.constraints.min_odds} - {config.constraints.max_odds}
                            </Text>
                        </View>

                        <View style={styles.configItem}>
                            <Text variant="caption" color="textSecondary">
                                Système
                            </Text>
                            <Text variant="body" weight="bold" color="text">
                                {config.constraints.max_matches} matchs
                            </Text>
                        </View>

                        <View style={styles.configItem}>
                            <Text variant="caption" color="textSecondary">
                                Cote totale max
                            </Text>
                            <Text variant="body" weight="bold" color="text">
                                {config.constraints.max_total_odds.toLocaleString()}
                            </Text>
                        </View>

                        <View style={styles.configItem}>
                            <Text variant="caption" color="textSecondary">
                                Mise par défaut
                            </Text>
                            <Text variant="body" weight="bold" color="primary">
                                {formatCurrency(config.settings.default_stake)}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.systemTypeContainer}>
                        <Text variant="caption" color="textSecondary">
                            Type de système: {config.system_type || 'mini_two_matches'}
                        </Text>
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
            )}

            {/* Ligne de séparation */}
            <View style={[styles.separator, { backgroundColor: colors.border }]} />

            {/* Configuration Form */}
            <View style={styles.section}>
                <Text variant="heading3" color="text">
                    Modifier la Configuration Mini
                </Text>

                {/* Cotes Section */}
                <View style={styles.formSection}>
                    <Text variant="body" weight="bold" color="text">
                        Contraintes de Cotes Mini
                    </Text>

                    <Input
                        label="Cote minimale"
                        value={formData.min_odds?.toString() || ''}
                        onChangeText={(value) => handleInputChange('min_odds', value)}
                        keyboardType="decimal-pad"
                        placeholder="1.1"
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

                {/* Limits Section */}
                <View style={styles.formSection}>
                    <Text variant="body" weight="bold" color="text">
                        Limites Mini
                    </Text>

                    <Input
                        label="Cote totale maximum"
                        value={formData.max_total_odds?.toString() || ''}
                        onChangeText={(value) => handleInputChange('max_total_odds', value)}
                        keyboardType="numeric"
                        placeholder="10000"
                        helperText="Entre 1 000 et 10 000 (spécifique au Mini)"
                        returnKeyType="done"
                        onSubmitEditing={Keyboard.dismiss}
                    />
                </View>

                {/* Settings Section */}
                <View style={styles.formSection}>
                    <Text variant="body" weight="bold" color="text">
                        Paramètres Mini
                    </Text>

                    <Input
                        label="Mise par défaut (MGA)"
                        value={formData.default_stake?.toString() || ''}
                        onChangeText={(value) => handleInputChange('default_stake', value)}
                        keyboardType="numeric"
                        placeholder="200"
                        helperText="Entre 100 et 100 000 MGA"
                        returnKeyType="done"
                        onSubmitEditing={Keyboard.dismiss}
                        required
                    />
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    <Button
                        title="Réinitialiser"
                        onPress={handleReset}
                        variant="outline"
                        disabled={!hasChanges || loading}
                        style={{ flex: 1 }}
                    />

                    <Button
                        title={loading ? 'Sauvegarde...' : 'Sauvegarder'}
                        onPress={handleSave}
                        variant="outline"
                        disabled={!hasChanges || loading}
                        loading={loading}
                        style={{
                            flex: 1,
                            borderColor: hasChanges ? colors.success : colors.textSecondary,
                        }}
                        textStyle={{
                            color: hasChanges ? colors.success : colors.textSecondary,
                        }}
                    />
                </View>
            </View>

            {/* Ligne de séparation */}
            <View style={[styles.separator, { backgroundColor: colors.border }]} />

            {/* Information Section */}
            <View style={styles.section}>
                <Text variant="heading3" color="text">
                    Informations Mini
                </Text>

                <View style={styles.infoList}>
                    <View style={styles.infoItem}>
                        <Ionicons name="flash-outline" size={16} color={colors.primary} />
                        <Text variant="caption" color="textSecondary" style={styles.infoText}>
                            Le système Mini est optimisé pour exactement 2 matchs avec des cotes modérées
                        </Text>
                    </View>

                    <View style={styles.infoItem}>
                        <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
                        <Text variant="caption" color="textSecondary" style={styles.infoText}>
                            Les limites de cotes totales sont plus basses pour réduire les risques
                        </Text>
                    </View>

                    <View style={styles.infoItem}>
                        <Ionicons name="shield-checkmark-outline" size={16} color={colors.success} />
                        <Text variant="caption" color="textSecondary" style={styles.infoText}>
                            Système idéal pour des gains réguliers avec une mise plus sûre
                        </Text>
                    </View>
                </View>
            </View>
        </>
    );

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={[
                styles.content,
                { paddingBottom: 50 }
            ]}
            refreshControl={
                <RefreshControl
                    refreshing={loading && !!config} // Only show refresh si on a déjà des données
                    onRefresh={onRefresh}
                    tintColor={colors.primary}
                    colors={[colors.primary]}
                />
            }
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
        >
            {initialLoading || (loading && !config) ? renderSkeletonContent() : renderContent()}
        </ScrollView>
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
    firstSection: {
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
    systemTypeContainer: {
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.1)',
        gap: spacing.xs,
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
});