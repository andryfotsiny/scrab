// GroloScreen.tsx - Refactorisé avec FootballProvider
import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/shared/context/ThemeContext';
import { useAuth } from '@/src/shared/context/AuthContext';
import { FootballProvider } from '@/src/features/football/context/FootballContext';

// Import des composants réutilisables
import Header from '@/src/components/molecules/Header';
import TabBar, { TabItem } from '@/src/components/molecules/TabBar';
import Text from '@/src/components/atoms/Text';

// Import des tabs
import AutoBetTab from './tabs/AutoBetTab';
import BetNowTab from './tabs/BetNowTab';
import ConfigurationTab from './tabs/ConfigurationTab';

type TabType = 'auto' | 'now' | 'config';

function GroloContent() {
    const { colors, mode } = useTheme();
    const { isAuthenticated, bet261UserData } = useAuth();
    const insets = useSafeAreaInsets();
    const [activeTab, setActiveTab] = useState<TabType>('auto');

    // Check authentication status
    useEffect(() => {
        if (!isAuthenticated || !bet261UserData) {
            console.log('⚠️ GroloScreen: User not authenticated, showing warning');
        }
    }, [isAuthenticated, bet261UserData]);

    const tabs: TabItem[] = [
        {
            id: 'auto',
            title: 'Pari Auto',
        },
        {
            id: 'now',
            title: 'Pari Maintenant',
        },
        {
            id: 'config',
            title: 'Configuration',
        },
    ];

    const handleTabPress = (tabId: string) => {
        setActiveTab(tabId as TabType);
    };

    const renderTabContent = () => {
        // Show message if not authenticated
        if (!isAuthenticated || !bet261UserData) {
            return (
                <View style={styles.notAuthenticatedContainer}>
                    <Text variant="heading3" color="text" style={{ marginBottom: 16 }}>
                        Connexion requise
                    </Text>
                    <Text variant="body" color="textSecondary" style={{ textAlign: 'center' }}>
                        Vous devez être connecté avec un compte Bet261 pour accéder aux fonctionnalités de paris football.
                    </Text>
                </View>
            );
        }

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
                        elevated={false}
                    />

                    {/* TabBar réutilisable */}
                    <TabBar
                        tabs={tabs}
                        activeTab={activeTab}
                        onTabPress={handleTabPress}
                        variant="default"
                        scrollable={true}
                    />

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

export default function GroloScreen() {
    return (
        <FootballProvider>
            <GroloContent />
        </FootballProvider>
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
    content: {
        flex: 1,
    },
    notAuthenticatedContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
});