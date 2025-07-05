// MiniScreen.tsx - Refactorisé avec les composants réutilisables
import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/shared/context/ThemeContext';
import { useMini } from '@/src/feature/football/hooks/useMini';

// Import des composants réutilisables
import Header from '@/src/components/molecules/Header';
import TabBar, { TabItem } from '@/src/components/molecules/TabBar';

// Import des tabs
import MiniAutoBetTab from './tabs/MiniAutoBetTab';
import MiniBetNowTab from './tabs/MiniBetNowTab';
import MiniConfigurationTab from './tabs/MiniConfigurationTab';

type TabType = 'auto' | 'now' | 'config';

export default function MiniScreen() {
    const { colors, mode } = useTheme();
    const insets = useSafeAreaInsets();
    const [activeTab, setActiveTab] = useState<TabType>('auto');
    const { loadConfig, config } = useMini();

    useEffect(() => {
        loadConfig().catch(console.error);
    }, [loadConfig]);

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
});