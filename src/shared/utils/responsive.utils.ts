// src/shared/utils/responsive.utils.ts
import { Dimensions, Platform } from 'react-native';
import { useState, useEffect } from 'react';

// Breakpoints pour la responsivité
export const BREAKPOINTS = {
    mobile: 0,
    tablet: 768,
    desktop: 1024,
    largeDesktop: 1440,
} as const;

// Types pour les tailles d'écran
export type ScreenSize = 'mobile' | 'tablet' | 'desktop' | 'largeDesktop';
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

// Interface pour les informations d'écran
export interface ScreenInfo {
    width: number;
    height: number;
    size: ScreenSize;
    device: DeviceType;
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    isLargeDesktop: boolean;
    isWeb: boolean;
    orientation: 'portrait' | 'landscape';
}

// Fonction pour déterminer la taille d'écran
export const getScreenSize = (width: number): ScreenSize => {
    if (width >= BREAKPOINTS.largeDesktop) return 'largeDesktop';
    if (width >= BREAKPOINTS.desktop) return 'desktop';
    if (width >= BREAKPOINTS.tablet) return 'tablet';
    return 'mobile';
};

// Fonction pour déterminer le type d'appareil
export const getDeviceType = (width: number): DeviceType => {
    if (width >= BREAKPOINTS.desktop) return 'desktop';
    if (width >= BREAKPOINTS.tablet) return 'tablet';
    return 'mobile';
};

// Hook personnalisé pour la responsivité
export const useResponsive = (): ScreenInfo => {
    const [screenInfo, setScreenInfo] = useState<ScreenInfo>(() => {
        const { width, height } = Dimensions.get('window');
        const size = getScreenSize(width);
        const device = getDeviceType(width);

        return {
            width,
            height,
            size,
            device,
            isMobile: device === 'mobile',
            isTablet: device === 'tablet',
            isDesktop: device === 'desktop',
            isLargeDesktop: size === 'largeDesktop',
            isWeb: Platform.OS === 'web',
            orientation: width > height ? 'landscape' : 'portrait',
        };
    });

    useEffect(() => {
        const subscription = Dimensions.addEventListener('change', ({ window }) => {
            const size = getScreenSize(window.width);
            const device = getDeviceType(window.width);

            setScreenInfo({
                width: window.width,
                height: window.height,
                size,
                device,
                isMobile: device === 'mobile',
                isTablet: device === 'tablet',
                isDesktop: device === 'desktop',
                isLargeDesktop: size === 'largeDesktop',
                isWeb: Platform.OS === 'web',
                orientation: window.width > window.height ? 'landscape' : 'portrait',
            });
        });

        return () => subscription?.remove();
    }, []);

    return screenInfo;
};

// Utilitaires pour les styles adaptatifs
export const responsiveSpacing = {
    mobile: {
        xs: 4,
        sm: 8,
        md: 12,
        lg: 16,
        xl: 24,
        xxl: 32,
    },
    tablet: {
        xs: 6,
        sm: 12,
        md: 16,
        lg: 20,
        xl: 28,
        xxl: 36,
    },
    desktop: {
        xs: 8,
        sm: 16,
        md: 20,
        lg: 24,
        xl: 32,
        xxl: 48,
    },
};

// Fonction pour obtenir l'espacement adaptatif
export const getResponsiveSpacing = (
    size: keyof typeof responsiveSpacing.mobile,
    device: DeviceType
): number => {
    return responsiveSpacing[device][size];
};

// Utilitaires pour les tailles de police adaptatives
export const responsiveFontSizes = {
    mobile: {
        caption: 12,
        body: 14,
        heading3: 18,
        heading2: 24,
        heading1: 32,
    },
    tablet: {
        caption: 14,
        body: 16,
        heading3: 20,
        heading2: 28,
        heading1: 36,
    },
    desktop: {
        caption: 14,
        body: 16,
        heading3: 22,
        heading2: 32,
        heading1: 42,
    },
};

// Fonction pour obtenir la taille de police adaptative
export const getResponsiveFontSize = (
    variant: keyof typeof responsiveFontSizes.mobile,
    device: DeviceType
): number => {
    return responsiveFontSizes[device][variant];
};

// Utilitaires pour les layouts adaptatifs
export const getLayoutConfig = (device: DeviceType) => {
    switch (device) {
        case 'desktop':
            return {
                sidebarWidth: 280,
                contentMaxWidth: 1400,
                gridColumns: 4,
                cardMinWidth: 250,
                headerHeight: 64,
                useFixedSidebar: true,
                useTabs: false,
                tableView: true,
            };
        case 'tablet':
            return {
                sidebarWidth: 0,
                contentMaxWidth: '100%',
                gridColumns: 2,
                cardMinWidth: 200,
                headerHeight: 56,
                useFixedSidebar: false,
                useTabs: true,
                tableView: false,
            };
        case 'mobile':
        default:
            return {
                sidebarWidth: 0,
                contentMaxWidth: '100%',
                gridColumns: 1,
                cardMinWidth: '100%',
                headerHeight: 56,
                useFixedSidebar: false,
                useTabs: true,
                tableView: false,
            };
    }
};

// Fonction pour adapter les styles selon l'appareil
export const adaptStyles = <T extends Record<string, any>>(
    baseStyles: T,
    adaptations: {
        tablet?: Partial<T>;
        desktop?: Partial<T>;
    },
    device: DeviceType
): T => {
    let styles = { ...baseStyles };

    if (device === 'tablet' && adaptations.tablet) {
        styles = { ...styles, ...adaptations.tablet };
    }

    if (device === 'desktop' && adaptations.desktop) {
        styles = { ...styles, ...adaptations.desktop };
    }

    return styles;
};

// Hook pour les styles adaptatifs
export const useAdaptiveStyles = <T extends Record<string, any>>(
    baseStyles: T,
    adaptations: {
        tablet?: Partial<T>;
        desktop?: Partial<T>;
    }
): T => {
    const { device } = useResponsive();
    return adaptStyles(baseStyles, adaptations, device);
};

// Utilitaire pour les grilles responsives
export const getGridItemWidth = (
    totalWidth: number,
    columns: number,
    gap: number
): number => {
    return (totalWidth - gap * (columns - 1)) / columns;
};

// Fonction pour calculer le nombre de colonnes optimal
export const getOptimalColumns = (
    containerWidth: number,
    minItemWidth: number,
    gap: number
): number => {
    const maxColumns = Math.floor((containerWidth + gap) / (minItemWidth + gap));
    return Math.max(1, maxColumns);
};

// Constantes pour les animations adaptatives
export const getAnimationDuration = (device: DeviceType): number => {
    switch (device) {
        case 'desktop':
            return 200; // Plus rapide sur desktop
        case 'tablet':
            return 250;
        case 'mobile':
        default:
            return 300; // Plus lent sur mobile pour une meilleure UX
    }
};

// Utilitaire pour les modales adaptatives
export const getModalConfig = (device: DeviceType) => {
    switch (device) {
        case 'desktop':
            return {
                width: '50%',
                maxWidth: 600,
                position: 'center' as const,
                backdrop: true,
            };
        case 'tablet':
            return {
                width: '80%',
                maxWidth: 500,
                position: 'center' as const,
                backdrop: true,
            };
        case 'mobile':
        default:
            return {
                width: '95%',
                maxWidth: '100%',
                position: 'bottom' as const,
                backdrop: true,
            };
    }
};

// Export par défaut avec toutes les utilitaires
export default {
    BREAKPOINTS,
    useResponsive,
    getScreenSize,
    getDeviceType,
    getResponsiveSpacing,
    getResponsiveFontSize,
    getLayoutConfig,
    adaptStyles,
    useAdaptiveStyles,
    getGridItemWidth,
    getOptimalColumns,
    getAnimationDuration,
    getModalConfig,
};