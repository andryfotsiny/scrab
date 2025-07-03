// src/feature/football/components/tabs/MiniAutoBetTab.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    RefreshControl,
} from 'react-native';
import { useTheme } from '@/src/shared/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useMini } from '@/src/feature/football/hooks/useMini';

export default function MiniAutoBetTab() {
    const { colors } = useTheme();
    const {
        loading,
        config,
        miniAutoExecutionActive,
        error,
        loadConfig,
        startAutoExecution,
        stopAutoExecution,
    } = useMini();

    const [localAutoActive, setLocalAutoActive] = useState(false);

    useEffect(() => {
        setLocalAutoActive(miniAutoExecutionActive);
    }, [miniAutoExecutionActive]);

    const onRefresh = useCallback(async () => {
        try {
            await loadConfig();
        } catch (err) {
            console.error('Refresh error:', err);
        }
    }, [loadConfig]);

    const handleToggleAutoExecution = async () => {
        try {
            if (localAutoActive) {
                await stopAutoExecution();
                Alert.alert('Succès', 'Exécution automatique Mini arrêtée');
            } else {
                await startAutoExecution();
                Alert.alert('Succès', 'Exécution automatique Mini démarrée pour 00h00 Madagascar');
            }
        } catch (err) {
            Alert.alert('Erreur', error || 'Une erreur est survenue');
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('mg-MG', {
            style: 'currency',
            currency: 'MGA',
        }).format(amount);
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={[
                styles.content,
                { paddingBottom: 24 }
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
        >
            {/* Configuration Card */}
            {config && (
                <View style={[styles.card, { backgroundColor: colors.surface }]}>
                    <View style={styles.cardHeader}>
                        <Text style={[styles.cardTitle, { color: colors.text }]}>
                            Configuration Mini (2 matchs)
                        </Text>
                        <View style={[styles.statusBadge, { backgroundColor: colors.success }]}>
                            <Text style={styles.statusText}>Actif</Text>
                        </View>
                    </View>

                    <View style={styles.configGrid}>
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
                                Nombre de matchs
                            </Text>
                            <Text style={[styles.configValue, { color: colors.text }]}>
                                {config.constraints.max_matches} matchs
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

                        <View style={styles.configItem}>
                            <Text style={[styles.configLabel, { color: colors.textSecondary }]}>
                                Gain max
                            </Text>
                            <Text style={[styles.configValue, { color: colors.primary }]}>
                                {formatCurrency(config.constraints.max_payout)}
                            </Text>
                        </View>
                    </View>
                </View>
            )}

            {/* Auto Execution Card */}
            <View style={[styles.card, { backgroundColor: colors.surface }]}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                    Exécution Automatique Mini
                </Text>

                <View style={styles.autoSection}>
                    <View style={styles.autoInfo}>
                        <Ionicons
                            name="flash-outline"
                            size={24}
                            color={colors.primary}
                        />
                        <View style={styles.autoTextContainer}>
                            <Text style={[styles.autoTitle, { color: colors.text }]}>
                                Pari automatique mini à 00h00
                            </Text>
                            <Text style={[styles.autoDescription, { color: colors.textSecondary }]}>
                                Système: 2 matchs sélectionnés automatiquement
                            </Text>
                        </View>
                    </View>

                    <View style={styles.statusContainer}>
                        <View style={[
                            styles.statusIndicator,
                            { backgroundColor: localAutoActive ? colors.success : colors.error }
                        ]} />
                        <Text style={[
                            styles.statusLabel,
                            { color: localAutoActive ? colors.success : colors.error }
                        ]}>
                            {localAutoActive ? 'Actif' : 'Inactif'}
                        </Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={[
                        styles.toggleButton,
                        {
                            backgroundColor: localAutoActive ? colors.error : colors.success
                        }
                    ]}
                    onPress={handleToggleAutoExecution}
                    disabled={loading}
                    activeOpacity={0.8}
                >
                    <Ionicons
                        name={localAutoActive ? 'stop' : 'play'}
                        size={20}
                        color="#ffffff"
                    />
                    <Text style={styles.toggleButtonText}>
                        {loading
                            ? 'Traitement...'
                            : localAutoActive
                                ? 'Arrêter l\'exécution automatique'
                                : 'Démarrer l\'exécution automatique'
                        }
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Information Card */}
            <View style={[styles.card, { backgroundColor: colors.surface }]}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                    Informations Mini
                </Text>

                <View style={styles.infoList}>
                    <View style={styles.infoItem}>
                        <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
                        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                            Le système Mini sélectionne automatiquement exactement 2 matchs
                        </Text>
                    </View>

                    <View style={styles.infoItem}>
                        <Ionicons name="checkmark-circle-outline" size={16} color={colors.success} />
                        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                            Cotes optimisées pour des gains réguliers avec risque réduit
                        </Text>
                    </View>

                    <View style={styles.infoItem}>
                        <Ionicons name="shield-checkmark-outline" size={16} color={colors.primary} />
                        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                            Exécution quotidienne à minuit (Madagascar)
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
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    cardTitle: {
        fontSize: 18,
        fontFamily: 'Poppins_700Bold',
        marginBottom: 16,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
    },
    statusText: {
        color: '#ffffff',
        fontSize: 12,
        fontFamily: 'Poppins_700Bold',
    },
    configGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
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
    autoSection: {
        marginBottom: 24,
    },
    autoInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    autoTextContainer: {
        marginLeft: 12,
        flex: 1,
    },
    autoTitle: {
        fontSize: 16,
        fontFamily: 'Poppins_600SemiBold',
        marginBottom: 4,
    },
    autoDescription: {
        fontSize: 14,
        fontFamily: 'Poppins_400Regular',
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statusIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    statusLabel: {
        fontSize: 14,
        fontFamily: 'Poppins_600SemiBold',
    },
    toggleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        gap: 8,
    },
    toggleButtonText: {
        color: '#ffffff',
        fontSize: 16,
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