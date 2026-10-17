// GroloTurboScreen.tsx - « Grolo Turbo » : même moteur de pari que Grolo (même FootballProvider,
// donc même configuration/matchs), seul l'onglet « Pari Auto » diffère (intervalle au lieu de minuit).
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
import { FootballProvider } from '@/src/features/football/context/FootballContext';

import Header from '@/src/components/molecules/Header';
import TabBar, { TabItem } from '@/src/components/molecules/TabBar';
import Text from '@/src/components/atoms/Text';
import AuthLoading from '@/src/components/molecules/AuthLoading';

import TurboAutoBetTab from './tabs/TurboAutoBetTab';
import BetNowTab from './tabs/BetNowTab';
import ConfigurationTab from './tabs/ConfigurationTab';

type TabType = 'auto' | 'now' | 'config';

function GroloTurboContent() {
    const { colors, mode } = useTheme();
    const { isAuthenticated, isAuthPending, bet261UserData } = useAuth();
    const insets = useSafeAreaInsets();
    const [activeTab, setActiveTab] = useState<TabType>('auto');

    const tabs: TabItem[] = [
        { id: 'auto', title: 'Pari Auto' },
        { id: 'now', title: 'Pari Maintenant' },
        { id: 'config', title: 'Configuration' },
    ];

    const handleTabPress = (tabId: string) => {
        setActiveTab(tabId as TabType);
    };

    const renderTabContent = () => {
        if (isAuthPending) {
            return <AuthLoading />;
        }

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
                return <TurboAutoBetTab />;
            case 'now':
                return <BetNowTab />;
            case 'config':
                return <ConfigurationTab />;
            default:
                return <TurboAutoBetTab />;
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
                    <Header
                        title="Grolo Turbo"
                        showBackButton={true}
                        elevated={false}
                    />

                    <TabBar
                        tabs={tabs}
                        activeTab={activeTab}
                        onTabPress={handleTabPress}
                        variant="default"
                        scrollable={true}
                    />

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

export default function GroloTurboScreen() {
    return (
        <FootballProvider>
            <GroloTurboContent />
        </FootballProvider>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    contentContainer: { flex: 1 },
    content: { flex: 1 },
    notAuthenticatedContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
});
