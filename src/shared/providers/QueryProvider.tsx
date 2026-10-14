// src/shared/providers/QueryProvider.tsx - VERSION SIMPLIFIÉE (sans DevTools)
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { isClientError } from '@/src/shared/services/helpers/apiClient';

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
                // Pas de retry pour les erreurs client (4xx : auth, validation, solde...) : le résultat ne changera pas
                if (isClientError(error)) {
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
                // Pas de retry dès que le serveur a répondu (4xx comme 5xx) : la requête a pu être traitée
                // (ex. un pari) et la renvoyer risquerait de la dupliquer. Seule une panne réseau est retentée.
                if (typeof error?.status === 'number') {
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