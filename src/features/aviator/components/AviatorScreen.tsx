// src/features/aviator/components/AviatorScreen.tsx
import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    RefreshControl,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/shared/context/ThemeContext';
import { useAuth } from '@/src/shared/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

import Button from '@/src/components/atoms/Button';
import Input from '@/src/components/atoms/Input';
import Text from '@/src/components/atoms/Text';
import SuccessModal from '@/src/components/molecules/SuccessModal';
import { spacing } from '@/src/styles';

import {
    useAviatorStatus,
    useStartAviatorBot,
    useStopAviatorBot,
} from '@/src/shared/hooks/aviator/useAviatorQueries';

export default function AviatorScreen() {
    const { colors, mode } = useTheme();
    const insets = useSafeAreaInsets();
    const { isAuthenticated, bet261UserData } = useAuth();

    const { data: status, isLoading: statusLoading, refetch } = useAviatorStatus();
    const startBot = useStartAviatorBot();
    const stopBot = useStopAviatorBot();

    const [stake, setStake] = useState('100');
    const [cashoutMultiplier, setCashoutMultiplier] = useState('2.0');

    const [showModal, setShowModal] = useState(false);
    const [modalData, setModalData] = useState({
        title: '',
        message: '',
        type: 'success' as 'success' | 'info',
    });

    const isActive = status?.active ?? false;
    const loading = statusLoading || startBot.isPending || stopBot.isPending;

    const handleToggle = async () => {
        try {
            if (isActive) {
                await stopBot.mutateAsync();
                setModalData({
                    title: 'Bot Aviator arrêté',
                    message: 'Le bot Aviator a été désactivé avec succès.',
                    type: 'info',
                });
            } else {
                const stakeValue = parseFloat(stake);
                const multiplierValue = parseFloat(cashoutMultiplier);

                if (!stakeValue || stakeValue < 10) {
                    setModalData({
                        title: 'Mise invalide',
                        message: 'La mise doit être d\'au moins 10 MGA.',
                        type: 'info',
                    });
                    setShowModal(true);
                    return;
                }
                if (!multiplierValue || multiplierValue < 1.01) {
                    setModalData({
                        title: 'Multiplicateur invalide',
                        message: 'Le multiplicateur d\'encaissement doit être supérieur à 1.01.',
                        type: 'info',
                    });
                    setShowModal(true);
                    return;
                }

                const result = await startBot.mutateAsync({
                    stake: stakeValue,
                    cashoutMultiplier: multiplierValue,
                });
                setModalData({
                    title: 'Bot Aviator démarré',
                    message: result.message,
                    type: 'success',
                });
            }
            setShowModal(true);
        } catch (err: any) {
            setModalData({
                title: 'Erreur',
                message: err?.message || 'Une erreur est survenue.',
                type: 'info',
            });
            setShowModal(true);
        }
    };

    if (!isAuthenticated || !bet261UserData) {
        return (
            <SafeAreaProvider>
                <View style={[styles.container, { backgroundColor: colors.background }]}>
                    <SafeAreaView style={styles.safeArea} edges={['top']}>
                        <View style={styles.notAuthenticatedContainer}>
                            <Text variant="heading3" color="text" style={{ marginBottom: 16 }}>
                                Connexion requise
                            </Text>
                            <Text variant="body" color="textSecondary" style={{ textAlign: 'center' }}>
                                Vous devez être connecté avec un compte Bet261 pour accéder au bot Aviator.
                            </Text>
                        </View>
                    </SafeAreaView>
                </View>
            </SafeAreaProvider>
        );
    }

    return (
        <SafeAreaProvider>
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <StatusBar
                    barStyle={mode === 'dark' ? 'light-content' : 'dark-content'}
                    backgroundColor={colors.background}
                    translucent={false}
                />

                <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]} edges={['top']}>
                    <View style={styles.header}>
                        <Text variant="heading2" color="text">Aviator</Text>
                    </View>

                    <KeyboardAvoidingView
                        style={styles.contentContainer}
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    >
                        <ScrollView
                            style={styles.container}
                            contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 90 }]}
                            refreshControl={
                                <RefreshControl refreshing={statusLoading} onRefresh={() => refetch()} tintColor={colors.primary} colors={[colors.primary]} />
                            }
                            showsVerticalScrollIndicator={false}
                        >
                            {/* Statut */}
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Text variant="heading3" color="text">Statut du bot</Text>
                                </View>

                                <View style={styles.statusRow}>
                                    <Ionicons name="airplane-outline" size={28} color={colors.primary} />
                                    <View style={styles.statusTextContainer}>
                                        <Text variant="body" weight="bold" color="text">
                                            Mise automatique + encaissement auto
                                        </Text>
                                        <Text variant="caption" color="textSecondary">
                                            Rejoue chaque manche jusqu'à l'arrêt
                                        </Text>
                                    </View>
                                    <View style={styles.statusContainer}>
                                        <View style={[styles.statusIndicator, { backgroundColor: isActive ? colors.success : colors.error }]} />
                                        <Text variant="caption" weight="bold" style={{ color: isActive ? colors.success : colors.error }}>
                                            {isActive ? 'Actif' : 'Inactif'}
                                        </Text>
                                    </View>
                                </View>

                                {isActive && status?.stake !== undefined && (
                                    <View style={styles.activeInfo}>
                                        <Text variant="caption" color="textSecondary">
                                            Mise : {status.stake} MGA · Encaissement auto : {status.cashout_multiplier}x
                                        </Text>
                                    </View>
                                )}
                            </View>

                            <View style={[styles.separator, { backgroundColor: colors.border }]} />

                            {/* Configuration - désactivée si le bot tourne déjà */}
                            <View style={styles.section}>
                                <Text variant="heading3" color="text">Configuration</Text>

                                <Input
                                    label="Mise (MGA)"
                                    keyboardType="numeric"
                                    value={stake}
                                    onChangeText={setStake}
                                    editable={!isActive}
                                    placeholder="100"
                                />

                                <Input
                                    label="Encaissement automatique (x)"
                                    keyboardType="numeric"
                                    value={cashoutMultiplier}
                                    onChangeText={setCashoutMultiplier}
                                    editable={!isActive}
                                    placeholder="2.0"
                                    helperText="Le bot encaisse dès que le multiplicateur atteint cette valeur"
                                />

                                <Button
                                    title={loading ? 'Traitement...' : isActive ? 'Arrêter le bot' : 'Démarrer le bot'}
                                    onPress={handleToggle}
                                    variant="outline"
                                    disabled={loading}
                                    loading={loading}
                                    style={{
                                        borderColor: isActive ? colors.error : colors.success,
                                        marginTop: spacing.md,
                                    }}
                                    textStyle={{ color: isActive ? colors.error : colors.success }}
                                />
                            </View>

                            <View style={[styles.separator, { backgroundColor: colors.border }]} />

                            {/* Informations */}
                            <View style={styles.section}>
                                <Text variant="heading3" color="text">Informations</Text>

                                <View style={styles.infoList}>
                                    <View style={styles.infoItem}>
                                        <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
                                        <Text variant="caption" color="textSecondary" style={styles.infoText}>
                                            Le bot place la mise et encaisse automatiquement dès que le multiplicateur cible est atteint, à chaque manche.
                                        </Text>
                                    </View>
                                    <View style={styles.infoItem}>
                                        <Ionicons name="warning-outline" size={16} color={colors.warning} />
                                        <Text variant="caption" color="textSecondary" style={styles.infoText}>
                                            Argent réel — chaque manche mise le montant configuré tant que le bot est actif.
                                        </Text>
                                    </View>
                                    <View style={styles.infoItem}>
                                        <Ionicons name="server-outline" size={16} color={colors.success} />
                                        <Text variant="caption" color="textSecondary" style={styles.infoText}>
                                            Tourne sur le serveur, pas sur ce téléphone — vous pouvez fermer l'app, le bot continue jusqu'à l'arrêt.
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </SafeAreaView>
            </View>

            <SuccessModal
                visible={showModal}
                onClose={() => setShowModal(false)}
                title={modalData.title}
                customMessage={modalData.message}
                type={modalData.type}
            />
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    contentContainer: {
        flex: 1,
    },
    header: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    content: {
        padding: spacing.lg,
        paddingTop: spacing.xs,
    },
    section: {
        paddingVertical: spacing.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    separator: {
        height: 1,
        marginVertical: spacing.xs,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusTextContainer: {
        marginLeft: spacing.sm,
        flex: 1,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    statusIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    activeInfo: {
        marginTop: spacing.sm,
        paddingLeft: spacing.xl + spacing.xs,
    },
    infoList: {
        gap: spacing.sm,
        marginTop: spacing.md,
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
    notAuthenticatedContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
});
