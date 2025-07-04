// src/feature/football/components/MiniScreen.tsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    TouchableOpacity,
    Dimensions,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/shared/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMini } from '@/src/feature/football/hooks/useMini';

// Import des composants de tab
import MiniAutoBetTab from './tabs/MiniAutoBetTab';
import MiniBetNowTab from './tabs/MiniBetNowTab';
import MiniConfigurationTab from './tabs/MiniConfigurationTab';

const { width } = Dimensions.get('window');

type TabType = 'auto' | 'now' | 'config';

export default function MiniScreen() {
    const { colors, mode } = useTheme();
    const insets = useSafeAreaInsets();
    const [activeTab, setActiveTab] = useState<TabType>('auto');
    const { loadConfig, config } = useMini();

    useEffect(() => {
        loadConfig().catch(console.error);
    }, [loadConfig]);

    const tabs = [
        {
            id: 'auto' as TabType,
            title: 'Pari Auto',
        },
        {
            id: 'now' as TabType,
            title: 'Pari Maintenant',
        },
        {
            id: 'config' as TabType,
            title: 'Configuration',
        },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'auto':
                return <MiniAutoBetTab />;
            case 'now':
                return <MiniBetNowTab />;
            case 'config':
                return <MiniConfigurationTab />;
            default:
                return <MiniAutoBetTab />;
        }
    };

    return (
        <SafeAreaProvider>
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <StatusBar
                    barStyle={mode === 'dark' ? 'light-content' : 'dark-content'}
                    backgroundColor={colors.background}
                    translucent={false}
                />

                <SafeAreaView
                    style={[styles.safeArea, { paddingTop: insets.top }]}
                    edges={['top']}
                >
                    {/* Header - Toujours visible */}
                    <View style={[styles.header, { backgroundColor: colors.background }]}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => router.back()}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="arrow-back" size={24} color={colors.text} />
                        </TouchableOpacity>
                        <Text style={[styles.headerTitle, { color: colors.text }]}>
                            Football Mini (2 matchs)
                        </Text>
                        <View style={styles.placeholder} />
                    </View>

                    {/* Custom Tab Bar - Toujours visible */}
                    <View style={[
                        styles.tabBarWrapper,
                        {
                            backgroundColor: colors.background,
                            elevation: 2,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.1,
                            shadowRadius: 4,
                            zIndex: 1000,
                        }
                    ]}>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.tabBarContent}
                            style={styles.tabBarContainer}
                            keyboardShouldPersistTaps="handled" // Permet de cliquer sur les tabs même avec le clavier ouvert
                        >
                            {tabs.map((tab) => (
                                <TouchableOpacity
                                    key={tab.id}
                                    style={styles.tabItem}
                                    onPress={() => setActiveTab(tab.id)}
                                    activeOpacity={0.7}
                                >
                                    <Text
                                        style={[
                                            styles.tabText,
                                            {
                                                color: activeTab === tab.id ? colors.primary : colors.textSecondary,
                                                fontFamily: activeTab === tab.id ? 'Poppins_700Bold' : 'Poppins_600SemiBold',
                                            },
                                        ]}
                                    >
                                        {tab.title}
                                    </Text>
                                    {activeTab === tab.id && (
                                        <View style={[styles.tabUnderline, { backgroundColor: colors.primary }]} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Content avec KeyboardAvoidingView */}
                    <KeyboardAvoidingView
                        style={styles.contentContainer}
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
                    >
                        <View style={[styles.content, { paddingBottom: insets.bottom + 20 }]}>
                            {renderTabContent()}
                        </View>
                    </KeyboardAvoidingView>
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
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingVertical: 16,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: 'Poppins_700Bold',
    },
    placeholder: {
        width: 40,
    },
    tabBarWrapper: {
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    tabBarContainer: {
        paddingHorizontal: 24,
    },
    tabBarContent: {
        paddingRight: 24,
    },
    tabItem: {
        position: 'relative',
        paddingVertical: 8,
        paddingHorizontal: 20,
        marginRight: 24,
    },
    tabText: {
        fontSize: 16,
        textAlign: 'center',
    },
    tabUnderline: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 3,
        borderRadius: 2,
    },
    contentContainer: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
});