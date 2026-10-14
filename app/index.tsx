import React, { useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/src/shared/context/AuthContext';

export default function WelcomeScreen() {
    const { hasSession, isRestoring } = useAuth();

    useEffect(() => {
        // Attendre la restauration de la session mémorisée, puis aller à l'app ou au login
        if (isRestoring) return;

        const timer = setTimeout(() => {
            router.replace(hasSession ? '/(main)' : '/(auth)/login');
        }, 500);

        return () => clearTimeout(timer);
    }, [isRestoring, hasSession]);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <Text style={styles.welcomeText}>Scrab</Text>
            <Text style={styles.subtitle}>Chargement...</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
    },
    welcomeText: {
        fontSize: 32,
        fontFamily: 'Poppins_700Bold',
        color: '#6366f1',
        marginBottom: 16,
    },
    subtitle: {
        fontSize: 16,
        fontFamily: 'Poppins_400Regular',
        color: '#64748b',
    },
});