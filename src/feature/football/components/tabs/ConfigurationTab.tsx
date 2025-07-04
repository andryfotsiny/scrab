// src/feature/football/components/tabs/ConfigurationTab.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    RefreshControl,
    TextInput,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useTheme } from '@/src/shared/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useFootball } from '@/src/feature/football/hooks/useFootball';
import { ConfigUpdateRequest } from '@/src/feature/football/types';

export default function ConfigurationTab() {
    const { colors } = useTheme();
    const {
        loading,
        config,
        error,
        loadConfig,
        updateConfig,
    } = useFootball();

    // Form state
    const [formData, setFormData] = useState<ConfigUpdateRequest>({});
    const [hasChanges, setHasChanges] = useState(false);
    const [lastUpdateTime, setLastUpdateTime] = useState<string | null>(null);

    useEffect(() => {
        loadConfig().catch(console.error);
    }, [loadConfig]);

    useEffect(() => {
        if (config) {
            const initialData = {
                min_odds: config.constraints.min_odds,
                max_odds: config.constraints.max_odds,
                max_matches: config.constraints.max_matches,
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

    const handleInputChange = (field: keyof ConfigUpdateRequest, value: string) => {
        const numericValue = parseFloat(value) || 0;
        const newFormData = { ...formData, [field]: numericValue };
        setFormData(newFormData);

        // Check if there are changes
        if (config) {
            const hasFieldChanges =
                newFormData.min_odds !== config.constraints.min_odds ||
                newFormData.max_odds !== config.constraints.max_odds ||
                newFormData.max_matches !== config.constraints.max_matches ||
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

        if (!formData.max_matches || formData.max_matches < 1 || formData.max_matches > 50) {
            return 'Le nombre maximum de matchs doit être entre 1 et 50';
        }

        if (!formData.max_total_odds || formData.max_total_odds < 1000 || formData.max_total_odds > 100000) {
            return 'La cote totale maximum doit être entre 1 000 et 100 000';
        }

        if (!formData.default_stake || formData.default_stake < 100 || formData.default_stake > 100000) {
            return 'La mise par défaut doit être entre 100 et 100 000 MGA';
        }

        return null;
    };

    const handleSave = async () => {
        console.log('🚀 handleSave called with formData:', formData);

        // Fermer le clavier d'abord
        Keyboard.dismiss();

        const validationError = validateForm();
        if (validationError) {
            console.log('❌ Validation error:', validationError);
            Alert.alert('Erreur de validation', validationError);
            return;
        }

        Alert.alert(
            'Confirmer les modifications',
            'Êtes-vous sûr de vouloir sauvegarder ces modifications ?',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Sauvegarder',
                    onPress: async () => {
                        console.log('✅ User confirmed save, calling updateConfig...');
                        try {
                            const result = await updateConfig(formData);
                            console.log('🎉 Config update successful:', result);

                            // Mettre à jour le temps de dernière modification
                            if (result.metadata && result.metadata.updated_at) {
                                setLastUpdateTime(result.metadata.updated_at);
                            }

                            Alert.alert(
                                'Configuration mise à jour',
                                `Modifications sauvegardées avec succès !\n\nChangements:\n${result.changes_made.join('\n')}`
                            );
                            setHasChanges(false);
                        } catch (err) {
                            console.log('💥 Config update failed:', err);
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
                max_matches: config.constraints.max_matches,
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

    const renderInputGroup = (
        label: string,
        field: keyof ConfigUpdateRequest,
        placeholder: string,
        helperText: string,
        keyboardType: 'numeric' | 'decimal-pad' = 'numeric'
    ) => (
        <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>
                {label}
            </Text>
            <TextInput
                style={[
                    styles.input,
                    {
                        backgroundColor: colors.background,
                        borderColor: colors.border || colors.textSecondary,
                        color: colors.text,
                    },
                ]}
                value={formData[field]?.toString() || ''}
                onChangeText={(value) => handleInputChange(field, value)}
                keyboardType={keyboardType}
                placeholder={placeholder}
                placeholderTextColor={colors.textSecondary}
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
                blurOnSubmit={true}
            />
            <Text style={[styles.inputHelper, { color: colors.textSecondary }]}>
                {helperText}
            </Text>
        </View>
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
                    refreshing={loading}
                    onRefresh={onRefresh}
                    tintColor={colors.primary}
                    colors={[colors.primary]}
                />
            }
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
        >
            {/* Current Configuration Display */}
            {config && (
                <View style={[styles.card, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>
                        Configuration Actuelle
                    </Text>

                    <View style={styles.currentConfigGrid}>
                        <View style={styles.configItem}>
                            <Text style={[styles.configLabel, { color: colors.textSecondary }]}>
                                Cotes
                            </Text>
                            <Text style={[styles.configValue, { color: colors.text }]}>
                                {config.constraints.min_odds} - {config.constraints.max_odds}
                            </Text>
                        </View>

                        <View style={styles.configItem}>
                            <Text style={[styles.configLabel, { color: colors.textSecondary }]}>
                                Max Matchs
                            </Text>
                            <Text style={[styles.configValue, { color: colors.text }]}>
                                {config.constraints.max_matches}
                            </Text>
                        </View>

                        <View style={styles.configItem}>
                            <Text style={[styles.configLabel, { color: colors.textSecondary }]}>
                                Cote totale max
                            </Text>
                            <Text style={[styles.configValue, { color: colors.text }]}>
                                {config.constraints.max_total_odds.toLocaleString()}
                            </Text>
                        </View>

                        <View style={styles.configItem}>
                            <Text style={[styles.configLabel, { color: colors.textSecondary }]}>
                                Mise par défaut
                            </Text>
                            <Text style={[styles.configValue, { color: colors.primary }]}>
                                {formatCurrency(config.settings.default_stake)}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.metadataContainer}>
                        <Text style={[styles.metadataText, { color: colors.textSecondary }]}>
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

            {/* Configuration Form */}
            <View style={[styles.card, { backgroundColor: colors.surface }]}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                    Modifier la Configuration
                </Text>

                {/* Cotes Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        Contraintes de Cotes
                    </Text>

                    {renderInputGroup(
                        'Cote minimale',
                        'min_odds',
                        '1.2',
                        'Entre 1.0 et 3.0',
                        'decimal-pad'
                    )}

                    {renderInputGroup(
                        'Cote maximale',
                        'max_odds',
                        '1.5',
                        'Entre 1.0 et 5.0',
                        'decimal-pad'
                    )}
                </View>

                {/* Limits Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        Limites
                    </Text>

                    {renderInputGroup(
                        'Nombre maximum de matchs',
                        'max_matches',
                        '40',
                        'Entre 1 et 50 matchs'
                    )}

                    {renderInputGroup(
                        'Cote totale maximum',
                        'max_total_odds',
                        '70000',
                        'Entre 1 000 et 100 000'
                    )}
                </View>

                {/* Settings Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        Paramètres
                    </Text>

                    {renderInputGroup(
                        'Mise par défaut (MGA)',
                        'default_stake',
                        '400',
                        'Entre 100 et 100 000 MGA'
                    )}
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={[
                            styles.resetButton,
                            { borderColor: colors.textSecondary },
                        ]}
                        onPress={handleReset}
                        disabled={!hasChanges || loading}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="refresh" size={20} color={colors.textSecondary} />
                        <Text style={[styles.resetButtonText, { color: colors.textSecondary }]}>
                            Réinitialiser
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.saveButton,
                            {
                                backgroundColor: hasChanges ? colors.success : colors.textSecondary,
                            },
                        ]}
                        onPress={handleSave}
                        disabled={!hasChanges || loading}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="checkmark" size={20} color="#ffffff" />
                        <Text style={styles.saveButtonText}>
                            {loading ? 'Sauvegarde...' : 'Sauvegarder'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Information Card */}
            <View style={[styles.card, { backgroundColor: colors.surface }]}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                    Informations importantes
                </Text>

                <View style={styles.infoList}>
                    <View style={styles.infoItem}>
                        <Ionicons name="warning-outline" size={16} color={colors.warning} />
                        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                            Les modifications prendront effet immédiatement après la sauvegarde
                        </Text>
                    </View>

                    <View style={styles.infoItem}>
                        <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
                        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                            La cote minimale doit toujours être inférieure à la cote maximale
                        </Text>
                    </View>

                    <View style={styles.infoItem}>
                        <Ionicons name="shield-checkmark-outline" size={16} color={colors.success} />
                        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                            Les paris automatiques respecteront ces nouvelles contraintes
                        </Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 24,
        paddingTop: 8,
    },
    card: {
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 18,
        fontFamily: 'Poppins_700Bold',
        marginBottom: 16,
    },
    currentConfigGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 16,
    },
    configItem: {
        flex: 1,
        minWidth: '45%',
    },
    configLabel: {
        fontSize: 14,
        fontFamily: 'Poppins_400Regular',
        marginBottom: 4,
    },
    configValue: {
        fontSize: 16,
        fontFamily: 'Poppins_700Bold',
    },
    metadataContainer: {
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.1)',
    },
    metadataText: {
        fontSize: 12,
        fontFamily: 'Poppins_400Regular',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: 'Poppins_600SemiBold',
        marginBottom: 16,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontFamily: 'Poppins_600SemiBold',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        fontFamily: 'Poppins_400Regular',
    },
    inputHelper: {
        fontSize: 12,
        fontFamily: 'Poppins_400Regular',
        marginTop: 4,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    resetButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
        gap: 8,
    },
    resetButtonText: {
        fontSize: 14,
        fontFamily: 'Poppins_600SemiBold',
    },
    saveButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        gap: 8,
    },
    saveButtonText: {
        color: '#ffffff',
        fontSize: 14,
        fontFamily: 'Poppins_600SemiBold',
    },
    infoList: {
        gap: 12,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        fontFamily: 'Poppins_400Regular',
        lineHeight: 20,
    },
});