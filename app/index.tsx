import React, { useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { router } from 'expo-router';

export default function WelcomeScreen() {
    useEffect(() => {
        // Redirection automatique vers l'écran de login après un court délai
        const timer = setTimeout(() => {
            router.replace('/(auth)/login');
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

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