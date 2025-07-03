// src/shared/context/ThemeContext.tsx
import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';
import { colors } from '../../styles';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
    mode: ThemeMode;
    colors: typeof colors.light;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
    children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
    const [mode, setMode] = useState<ThemeMode>('light');

    // Fonction stable avec useCallback
    const toggleTheme = useCallback(() => {
        setMode(prevMode => prevMode === 'light' ? 'dark' : 'light');
    }, []);

    // Valeur stable avec useMemo - clés explicites pour éviter les re-calculs
    const contextValue = useMemo(() => ({
        mode,
        colors: colors[mode], // Accès direct, pas de fonction
        toggleTheme,
    }), [mode, toggleTheme]); // Dépendances explicites

    return (
        <ThemeContext.Provider value={contextValue}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}