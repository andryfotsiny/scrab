import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '@/src/shared/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import ThemeToggle from '@/src/components/atoms/ThemeToggle';

export default function OtherScreen() {
    const { colors, mode } = useTheme();
    const insets = useSafeAreaInsets();

    const handleLogout = () => {
        Alert.alert(
            'Déconnexion',
            'Êtes-vous sûr de vouloir vous déconnecter ?',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Déconnecter',
                    style: 'destructive',
                    onPress: () => router.replace('/')
                },
            ]
        );
    };

    const menuItems = [
        {
            title: 'Paramètres',
            icon: 'settings-outline' as const,
            onPress: () => Alert.alert('Info', 'Fonctionnalité en cours de développement'),
        },
        {
            title: 'Historique des transactions',
            icon: 'receipt-outline' as const,
            onPress: () => Alert.alert('Info', 'Fonctionnalité en cours de développement'),
        },
        {
            title: 'Notifications',
            icon: 'notifications-outline' as const,
            onPress: () => Alert.alert('Info', 'Fonctionnalité en cours de développement'),
        },
        {
            title: 'Aide & Support',
            icon: 'help-circle-outline' as const,
            onPress: () => Alert.alert('Info', 'Fonctionnalité en cours de développement'),
        },
        {
            title: 'À propos',
            icon: 'information-circle-outline' as const,
            onPress: () => Alert.alert('À propos', 'Scrab v1.0.0\nApplication de paris sportifs'),
        },
        {
            title: 'Conditions d\'utilisation',
            icon: 'document-text-outline' as const,
            onPress: () => Alert.alert('Info', 'Fonctionnalité en cours de développement'),
        },
    ];

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
                    <View style={styles.header}>
                        <Text style={[styles.headerTitle, { color: colors.text }]}>
                            Autres
                        </Text>
                        <ThemeToggle />
                    </View>

                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={[
                            styles.scrollContent,
                            { paddingBottom: insets.bottom + 90 } // Espace pour tab bar + zone système
                        ]}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Menu principal */}
                        <View style={[styles.card, { backgroundColor: colors.surface }]}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                Menu
                            </Text>

                            {menuItems.map((item, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.menuItem,
                                        index < menuItems.length - 1 && {
                                            borderBottomColor: colors.textSecondary + '20',
                                            borderBottomWidth: 1,
                                        }
                                    ]}
                                    onPress={item.onPress}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.menuItemLeft}>
                                        <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
                                            <Ionicons
                                                name={item.icon}
                                                size={20}
                                                color={colors.primary}
                                            />
                                        </View>
                                        <Text style={[styles.menuItemText, { color: colors.text }]}>
                                            {item.title}
                                        </Text>
                                    </View>
                                    <Ionicons
                                        name="chevron-forward"
                                        size={18}
                                        color={colors.textSecondary}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Section déconnexion */}
                        <TouchableOpacity
                            style={[styles.logoutButton, {
                                borderColor: colors.error || '#ef4444',
                                backgroundColor: (colors.error || '#ef4444') + '10'
                            }]}
                            onPress={handleLogout}
                            activeOpacity={0.8}
                        >
                            <Ionicons
                                name="log-out-outline"
                                size={20}
                                color={colors.error || '#ef4444'}
                                style={styles.logoutIcon}
                            />
                            <Text style={[styles.logoutButtonText, { color: colors.error || '#ef4444' }]}>
                                Se déconnecter
                            </Text>
                        </TouchableOpacity>

                        {/* Info app */}
                        <View style={[styles.card, { backgroundColor: colors.surface }]}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                Application
                            </Text>
                            <View style={styles.appInfo}>
                                <Text style={[styles.versionText, { color: colors.textSecondary }]}>
                                    Version 1.0.0
                                </Text>
                                <Text style={[styles.versionText, { color: colors.textSecondary }]}>
                                    © 2024 Scrab
                                </Text>
                                <Text style={[styles.versionText, { color: colors.textSecondary, fontSize: 12 }]}>
                                    Conçu pour respecter les zones système
                                </Text>
                            </View>
                        </View>
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
        paddingTop: 8, // Espace réduit car SafeAreaView gère déjà l'encoche
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
    card: {
        borderRadius: 12,
        padding: 24,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'Poppins_700Bold',
        marginBottom: 16,
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    menuItemText: {
        fontSize: 16,
        fontFamily: 'Poppins_400Regular',
    },
    logoutButton: {
        borderWidth: 2,
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 24,
    },
    logoutIcon: {
        marginRight: 8,
    },
    logoutButtonText: {
        fontSize: 16,
        fontFamily: 'Poppins_700Bold',
    },
    appInfo: {
        alignItems: 'center',
    },
    versionText: {
        fontSize: 14,
        fontFamily: 'Poppins_400Regular',
        textAlign: 'center',
        marginTop: 4,
    },
});