// app/(auth)/_layout.tsx
import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/src/shared/context/AuthContext';

export default function AuthLayout() {
    const { hasSession, isRestoring } = useAuth();

    // Session déjà ouverte (ex. rechargement de la page sur /login) : inutile de redemander le mot de passe
    if (!isRestoring && hasSession) {
        return <Redirect href="/(main)" />;
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen
                name="login"
                options={{
                    headerShown: false,
                    gestureEnabled: false,
                }}
            />
        </Stack>
    );
}
