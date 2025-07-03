// app/(main)/_layout.tsx
import { Stack } from 'expo-router';

export default function MainLayout() {
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