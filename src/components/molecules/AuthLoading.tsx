// src/components/molecules/AuthLoading.tsx
// Écran de chargement affiché pendant la restauration de la session (à la place de « Connexion requise »).
import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useTheme } from '@/src/shared/context/ThemeContext';
import Text from '@/src/components/atoms/Text';

export default function AuthLoading({ fullScreen = false }: { fullScreen?: boolean }) {
    const { colors } = useTheme();

    return (
        <View style={[styles.container, fullScreen && { backgroundColor: colors.background }]}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text variant="body" color="textSecondary" style={styles.text}>
                Chargement...
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    text: {
        marginTop: 12,
    },
});
