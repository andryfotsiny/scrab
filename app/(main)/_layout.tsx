// app/(main)/_layout.tsx
import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/src/shared/context/AuthContext';
import AuthLoading from '@/src/components/molecules/AuthLoading';

export default function MainLayout() {
    const { hasSession, isRestoring } = useAuth();

    // Rechargement de la page : attendre la restauration de la session au lieu d'afficher « Connexion requise »
    if (isRestoring) {
        return <AuthLoading fullScreen />;
    }

    // Aucune session (jamais connecté, ou session expirée) : directement le login
    if (!hasSession) {
        return <Redirect href="/(auth)/login" />;
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen
                name="(tabs)"
                options={{
                    headerShown: false,
                    gestureEnabled: false,
                }}
            />
        </Stack>
    );
}
