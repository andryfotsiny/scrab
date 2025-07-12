// app/(main)/(tabs)/_layout.tsx - UPDATED avec onglet admin protégé
import { Tabs } from 'expo-router';
import { useTheme } from '@/src/shared/context/ThemeContext';
import { useAuth } from '@/src/shared/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
    const { colors, mode } = useTheme();
    const { canAccessAdminPanel } = useAuth();
    const insets = useSafeAreaInsets();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: colors.surface,
                    borderTopColor: colors.border || colors.textSecondary,
                    borderTopWidth: 1,
                    paddingBottom: Math.max(insets.bottom, 8),
                    paddingTop: 8,
                    height: Math.max(70 + insets.bottom, 70),
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textSecondary,
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontFamily: 'Poppins_400Regular',
                    marginTop: 4,
                    paddingBottom: Platform.OS === 'ios' ? 0 : 4,
                },
                tabBarItemStyle: {
                    paddingVertical: 4,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Profil',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="football"
                options={{
                    title: 'Football',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="football-outline" size={size} color={color} />
                    ),
                }}
            />

            {/* 🆕 Onglet Admin - Visible seulement aux administrateurs */}
            <Tabs.Screen
                name="admin"
                options={{
                    // 🔐 Protection: onglet visible seulement si l'utilisateur est admin
                    href: canAccessAdminPanel() ? '/admin' : null,
                    title: 'Admin',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="shield-outline" size={size} color={color} />
                    ),
                    // Badge pour indiquer le statut admin
                    tabBarBadge: canAccessAdminPanel() ? '●' : undefined,
                    tabBarBadgeStyle: {
                        backgroundColor: colors.warning,
                        color: 'transparent',
                        fontSize: 8,
                        minWidth: 8,
                        height: 8,
                        borderRadius: 4,
                        marginTop: -2,
                    },
                }}
            />

            <Tabs.Screen
                name="other"
                options={{
                    title: 'Autre',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="apps-outline" size={size} color={color} />
                    ),
                }}
            />

            {/* Écrans cachés dans les tabs mais accessibles via navigation */}
            <Tabs.Screen
                name="grolo"
                options={{
                    href: null, // Cache cet onglet de la barre de navigation
                    title: 'Grolo',
                }}
            />
            <Tabs.Screen
                name="mini"
                options={{
                    href: null, // Cache cet onglet de la barre de navigation
                    title: 'Mini',
                }}
            />
        </Tabs>
    );
}