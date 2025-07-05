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
                            style={styles.menuItem}
                            onPress={handleGroloPress}
                            activeOpacity={0.7}
                        >
                            <View style={styles.menuContent}>
                                <Ionicons
                                    name="trophy-outline"
                                    size={24}
                                    color={colors.primary}
                                />
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

                        {/* Ligne de séparation */}
                        <View style={[styles.separator, { backgroundColor: colors.border }]} />

                        {/* Mini */}
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={handleMiniPress}
                            activeOpacity={0.7}
                        >
                            <View style={styles.menuContent}>
                                <Ionicons
                                    name="flash-outline"
                                    size={24}
                                    color={colors.primary}
                                />
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
    menuItem: {
        paddingVertical: 20,
    },
    menuContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    textContainer: {
        flex: 1,
        marginLeft: 16,
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
    separator: {
        height: 1,
        marginVertical: 8,
    },
});