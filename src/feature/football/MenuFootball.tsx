// src/feature/football/MenuFootball.tsx (Updated)
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/shared/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function MenuFootball() {
    const { colors, mode } = useTheme();
    const insets = useSafeAreaInsets();

    const handleGroloPress = () => {
        router.push('/(main)/grolo');
    };

    const handleMiniPress = () => {
        router.push('/(main)/mini');
    };

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
                            Football
                        </Text>
                    </View>

                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={[
                            styles.scrollContent,
                            { paddingBottom: insets.bottom + 90 } // Espace pour tab bar + zone système
                        ]}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Grolo */}
                        <TouchableOpacity
                            style={[styles.menuCard, { backgroundColor: colors.surface }]}
                            onPress={handleGroloPress}
                            activeOpacity={0.7}
                        >
                            <View style={styles.menuContent}>
                                <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
                                    <Ionicons
                                        name="trophy-outline"
                                        size={32}
                                        color={colors.primary}
                                    />
                                </View>
                                <View style={styles.textContainer}>
                                    <Text style={[styles.menuTitle, { color: colors.text }]}>
                                        Grolo
                                    </Text>
                                    <Text style={[styles.menuDescription, { color: colors.textSecondary }]}>
                                        Jeux de grilles et pronostics (jusqu'à 40 matchs)
                                    </Text>
                                </View>
                                <Ionicons
                                    name="chevron-forward"
                                    size={20}
                                    color={colors.textSecondary}
                                />
                            </View>
                        </TouchableOpacity>

                        {/* Mini */}
                        <TouchableOpacity
                            style={[styles.menuCard, { backgroundColor: colors.surface }]}
                            onPress={handleMiniPress}
                            activeOpacity={0.7}
                        >
                            <View style={styles.menuContent}>
                                <View style={[styles.iconContainer, { backgroundColor: colors.success + '15' }]}>
                                    <Ionicons
                                        name="flash-outline"
                                        size={32}
                                        color={colors.success}
                                    />
                                </View>
                                <View style={styles.textContainer}>
                                    <Text style={[styles.menuTitle, { color: colors.text }]}>
                                        Mini
                                    </Text>
                                    <Text style={[styles.menuDescription, { color: colors.textSecondary }]}>
                                        Paris rapides et sûrs (exactement 2 matchs)
                                    </Text>
                                </View>
                                <Ionicons
                                    name="chevron-forward"
                                    size={20}
                                    color={colors.textSecondary}
                                />
                            </View>
                        </TouchableOpacity>
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
    menuCard: {
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
    },
    menuContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 20,
        fontFamily: 'Poppins_700Bold',
        marginBottom: 4,
    },
    menuDescription: {
        fontSize: 14,
        fontFamily: 'Poppins_400Regular',
    },
});