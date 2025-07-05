// GroloScreen.tsx - Refactorisé avec les composants réutilisables
import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    StatusBar,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/shared/context/ThemeContext';
import { useFootball } from '@/src/feature/football/hooks/useFootball';

// Import des composants réutilisables
import Header from '@/src/components/molecules/Header';
import Text from '@/src/components/atoms/Text';

// Import des tabs
import AutoBetTab from './tabs/AutoBetTab';
import BetNowTab from './tabs/BetNowTab';
import ConfigurationTab from './tabs/ConfigurationTab';

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

                <SafeAreaView style={styles.safeArea} edges={['top']}>
                    {/* Header réutilisable */}
                    <Header
                        title="Football Grolo"
                        showBackButton={true}
                        elevated={true}
                    />

                    {/* Custom Tab Bar */}
                    <View style={[
                        styles.tabBarWrapper,
                        {
                            backgroundColor: colors.background,
                            borderBottomColor: colors.border,
                        }
                    ]}>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.tabBarContent}
                            style={styles.tabBarContainer}
                            keyboardShouldPersistTaps="handled"
                        >
                            {tabs.map((tab) => (
                                <TouchableOpacity
                                    key={tab.id}
                                    style={styles.tabItem}
                                    onPress={() => setActiveTab(tab.id)}
                                    activeOpacity={0.7}
                                >
                                    <Text
                                        variant="body"
                                        weight={activeTab === tab.id ? 'bold' : 'regular'}
                                        color={activeTab === tab.id ? 'primary' : 'textSecondary'}
                                        align="center"
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
    tabBarWrapper: {
        paddingBottom: 8,
        borderBottomWidth: 1,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        zIndex: 1000,
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