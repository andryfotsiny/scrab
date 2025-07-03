// src/styles/index.ts
export const colors = {
    light: {
        primary: '#6366f1',
        primaryDark: '#4f46e5',
        secondary: '#f1f5f9',
        background: '#ffffff',
        surface: '#f8fafc',
        text: '#1e293b',
        textSecondary: '#64748b',
        border: '#e2e8f0',
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        shadow: 'rgba(0, 0, 0, 0.1)',
    },
    dark: {
        primary: '#818cf8',
        primaryDark: '#6366f1',
        secondary: '#1e293b',
        background: '#0f172a',
        surface: '#1e293b',
        text: '#f1f5f9',
        textSecondary: '#94a3b8',
        border: '#334155',
        success: '#34d399',
        error: '#f87171',
        warning: '#fbbf24',
        shadow: 'rgba(0, 0, 0, 0.3)',
    },
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const typography = {
    fontFamily: {
        regular: 'Poppins_400Regular',
        bold: 'Poppins_700Bold',
    },
    fontSize: {
        xs: 12,
        sm: 14,
        md: 16,
        lg: 18,
        xl: 20,
        xxl: 24,
        xxxl: 32,
    },
    lineHeight: {
        tight: 1.2,
        normal: 1.5,
        relaxed: 1.8,
    },
};

export const borderRadius = {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
};

export const shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.18,
        shadowRadius: 1.0,
        elevation: 1,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        elevation: 4,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
};