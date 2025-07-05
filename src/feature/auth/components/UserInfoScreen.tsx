// src/features/auth/components/UserProfileScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    ScrollView,
    RefreshControl,
    Alert,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/shared/context/ThemeContext';
import ThemeToggle from '@/src/components/atoms/ThemeToggle';
import Skeleton, { SkeletonText } from '@/src/components/atoms/Skeleton';
import { authService, UserInfo } from '@/src/shared/services/api/auth/auth.api';

export default function UserProfileScreen() {
    const { colors, mode } = useTheme();
    const insets = useSafeAreaInsets();
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [loading, setLoading] = useState(true); // Start avec true pour le skeleton initial

    const loadUserInfo = useCallback(async () => {
        setLoading(true);
        try {
            const data = await authService.getUserInfo();
            setUserInfo(data);
        } catch (error) {
            console.error('Load user info error:', error);
            Alert.alert('Erreur', 'Impossible de charger les informations utilisateur');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUserInfo();
    }, [loadUserInfo]);

    const formatBalance = useCallback((balance: number) => {
        return new Intl.NumberFormat('mg-MG', {
            style: 'currency',
            currency: 'MGA',
        }).format(balance);
    }, []);

    const renderSkeletonContent = () => (
        <>
            {/* Section Informations Skeleton */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Skeleton width="40%" height={24} />
                    <Skeleton width={60} height={28} borderRadius={14} />
                </View>

                <View style={styles.infoRow}>
                    <Skeleton width="25%" height={16} />
                    <Skeleton width="45%" height={16} />
                </View>
            </View>

            {/* Ligne de séparation */}
            <View style={[styles.separator, { backgroundColor: colors.border }]} />

            {/* Section Solde Skeleton */}
            <View style={styles.section}>
                <Skeleton width="30%" height={24} style={{ marginBottom: 24 }} />

                <View style={styles.balanceContainer}>
                    <Skeleton width="40%" height={14} style={{ marginBottom: 16 }} />
                    <Skeleton width="60%" height={32} />
                </View>
            </View>
        </>
    );

    const renderContent = () => (
        <>
            {/* Section Informations */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        Informations
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: colors.success }]}>
                        <Text style={styles.statusText}>Actif</Text>
                    </View>
                </View>

                <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                        Login
                    </Text>
                    <Text style={[styles.infoValue, { color: colors.text }]}>
                        {userInfo?.login}
                    </Text>
                </View>
            </View>

            {/* Ligne de séparation */}
            <View style={[styles.separator, { backgroundColor: colors.border }]} />

            {/* Section Solde */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Solde
                </Text>

                <View style={styles.balanceContainer}>
                    <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>
                        Solde principal
                    </Text>
                    <Text style={[styles.balanceValue, { color: colors.primary }]}>
                        {userInfo ? formatBalance(userInfo.balance) : ''}
                    </Text>
                </View>
            </View>
        </>
    );

    return (
        <SafeAreaProvider>
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <StatusBar
                    barStyle={mode === 'dark' ? 'light-content' : 'dark-content'}
                    backgroundColor={colors.background}
                    translucent={false}
                />

                {/* Zone sécurisée pour l'encoche/barre de statut */}
                <SafeAreaView
                    style={[styles.safeArea, { paddingTop: insets.top }]}
                    edges={['top']}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={[styles.headerTitle, { color: colors.text }]}>
                            Mon Profil
                        </Text>
                        <ThemeToggle />
                    </View>

                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={[
                            styles.scrollContent,
                            { paddingBottom: insets.bottom + 90 } // Espace pour tab bar + zone système
                        ]}
                        refreshControl={
                            <RefreshControl
                                refreshing={loading && !!userInfo} // Only show refresh si on a déjà des données
                                onRefresh={loadUserInfo}
                                tintColor={colors.primary}
                                colors={[colors.primary]}
                            />
                        }
                        showsVerticalScrollIndicator={false}
                    >
                        {loading && !userInfo ? renderSkeletonContent() : renderContent()}
                    </ScrollView>
                </SafeAreaView>
            </View>
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
        paddingTop: 8,
    },
    headerTitle: {
        fontSize: 24,
        fontFamily: 'Poppins_700Bold',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
    },
    section: {
        paddingVertical: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'Poppins_700Bold',
        marginBottom: 16,
    },
    separator: {
        height: 1,
        marginVertical: 8,
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
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    infoLabel: {
        fontSize: 16,
        fontFamily: 'Poppins_400Regular',
    },
    infoValue: {
        fontSize: 16,
        fontFamily: 'Poppins_700Bold',
    },
    balanceContainer: {
        alignItems: 'center',
        paddingVertical: 16,
    },
    balanceLabel: {
        fontSize: 14,
        fontFamily: 'Poppins_400Regular',
        marginBottom: 8,
    },
    balanceValue: {
        fontSize: 32,
        fontFamily: 'Poppins_700Bold',
    },
});