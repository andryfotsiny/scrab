import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    TouchableOpacity,
    Dimensions,
    ScrollView,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/shared/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useFootball } from '@/src/feature/football/hooks/useFootball';

// Import des composants de tab
import AutoBetTab from './tabs/AutoBetTab';
import BetNowTab from './tabs/BetNowTab';
import ConfigurationTab from './tabs/ConfigurationTab';

const { width } = Dimensions.get('window');

type TabType = 'auto' | 'now' | 'config';

export default function GroloScreen() {
    const { colors, mode } = useTheme();
    const insets = useSafeAreaInsets();
    const [activeTab, setActiveTab] = useState<TabType>('auto');
    const { loadConfig, config } = useFootball();

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
                return <AutoBetTab />;
            case 'now':
                return <BetNowTab />;
            case 'config':
                return <ConfigurationTab />;
            default:
                return <AutoBetTab />;
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
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => router.back()}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="arrow-back" size={24} color={colors.text} />
                        </TouchableOpacity>
                        <Text style={[styles.headerTitle, { color: colors.text }]}>
                            Football Grolo
                        </Text>
                        <View style={styles.placeholder} />
                    </View>

                    {/* Custom Tab Bar avec ScrollView */}
                    <View style={[styles.tabBarWrapper, { backgroundColor: colors.background }]}>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.tabBarContent}
                            style={styles.tabBarContainer}
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

                    {/* Tab Content */}
                    <View style={[styles.content, { paddingBottom: insets.bottom + 90 }]}>
                        {renderTabContent()}
                    </View>
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
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
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
    content: {
        flex: 1,
    },
});