// MiniScreen.tsx - Refactorisé avec MiniProvider
import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/shared/context/ThemeContext';
import { useAuth } from '@/src/shared/context/AuthContext';
import { MiniProvider } from '@/src/features/football/context/MiniContext';

// Import des composants réutilisables
import Header from '@/src/components/molecules/Header';
import TabBar, { TabItem } from '@/src/components/molecules/TabBar';
import Text from '@/src/components/atoms/Text';

// Import des tabs
import MiniAutoBetTab from './tabs/MiniAutoBetTab';
import MiniBetNowTab from './tabs/MiniBetNowTab';
import MiniConfigurationTab from './tabs/MiniConfigurationTab';

type TabType = 'auto' | 'now' | 'config';

function MiniContent() {
    const { colors, mode } = useTheme();
    const { isAuthenticated, bet261UserData } = useAuth();
    const insets = useSafeAreaInsets();
    const [activeTab, setActiveTab] = useState<TabType>('auto');

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
                        Vous devez être connecté avec un compte Bet261 pour accéder aux fonctionnalités de paris Mini (2 matchs).
                    </Text>
                </View>
            );
        }

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

                <SafeAreaView style={styles.safeArea} edges={['top']}>
                    {/* Header réutilisable */}
                    <Header
                        title="Football Mini (2 matchs)"
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

export default function MiniScreen() {
    return (
        <MiniProvider>
            <MiniContent />
        </MiniProvider>
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