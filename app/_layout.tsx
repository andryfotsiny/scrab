// app/_layout.tsx - UPDATED avec QueryProvider
import { Stack } from 'expo-router';
import { useFonts, Poppins_400Regular, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';

// ✅ Import du QueryProvider
import { QueryProvider } from '@/src/shared/providers/QueryProvider';
import { ThemeProvider } from '../src/shared/context/ThemeContext';
import { AuthProvider } from '@/src/shared/context/AuthContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [loaded] = useFonts({
        Poppins_400Regular,
        Poppins_700Bold,
    });

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);

    if (!loaded) {
        return null;
    }

    return (
        // ✅ QueryProvider en premier - gère le cache global React Query
        <QueryProvider>
            <ThemeProvider>
                {/* ✅ AuthProvider maintenant simplifié - utilise React Query sous le capot */}
                <AuthProvider>
                    <Stack screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="index" options={{ headerShown: false }} />
                        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                        <Stack.Screen name="(main)" options={{ headerShown: false }} />
                    </Stack>
                </AuthProvider>
            </ThemeProvider>
        </QueryProvider>
    );
}