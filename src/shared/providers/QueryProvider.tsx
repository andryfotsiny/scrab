// src/shared/providers/QueryProvider.tsx - VERSION SIMPLIFIÉE (sans DevTools)
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Configuration optimisée pour React Native/Expo + Web
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // 🔋 Optimisations mobile
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000,   // 10 minutes (remplace cacheTime)
            refetchOnWindowFocus: false, // Pas de refetch au focus sur mobile
            refetchOnReconnect: true,    // Refetch quand réseau revient

            // 📱 Gestion réseau mobile
            retry: (failureCount, error: any) => {
                // Pas de retry pour les erreurs d'auth
                if (error?.message?.includes('401') || error?.message?.includes('403')) {
                    return false;
                }
                // Retry réseau jusqu'à 3 fois
                if (error?.message?.includes('Network') || error?.message?.includes('fetch')) {
                    return failureCount < 3;
                }
                // Autres erreurs: 2 retry max
                return failureCount < 2;
            },

            // ⏱️ Délais progressifs
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        },
        mutations: {
            // 🔄 Retry pour les mutations importantes
            retry: (failureCount, error: any) => {
                // Pas de retry pour les erreurs d'auth ou validation
                if (error?.message?.includes('401') ||
                    error?.message?.includes('403') ||
                    error?.message?.includes('400')) {
                    return false;
                }
                // 1 retry pour les autres erreurs
                return failureCount < 1;
            },
        },
    },
});

interface QueryProviderProps {
    children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {/* ✅ PAS de DevTools - évite les problèmes de compatibilité */}
        </QueryClientProvider>
    );
}

// Export du client pour usage direct si nécessaire
export { queryClient };