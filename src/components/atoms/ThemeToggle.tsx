// src/components/atoms/ThemeToggle.tsx
import React, { memo } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../shared/context/ThemeContext';

// Memo pour éviter les re-renders inutiles
const ThemeToggle = memo(() => {
    const { mode, toggleTheme, colors } = useTheme();

    return (
        <TouchableOpacity
            style={[styles.container, { backgroundColor: colors.surface }]}
            onPress={toggleTheme}
            activeOpacity={0.7}
        >
            <Ionicons
                name={mode === 'dark' ? 'sunny-outline' : 'moon-outline'}
                size={24}
                color={colors.text}
            />
        </TouchableOpacity>
    );
});

ThemeToggle.displayName = 'ThemeToggle';

const styles = StyleSheet.create({
    container: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
});

export default ThemeToggle;