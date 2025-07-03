// app/(main)/index.tsx
import { useEffect } from 'react';
import { router } from 'expo-router';

export default function MainIndex() {
    useEffect(() => {
        // Redirection automatique vers les tabs
        router.replace('/(main)/(tabs)');
    }, []);

    return null;
}