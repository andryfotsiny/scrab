// src/shared/hooks/aviator/useAviatorQueries.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { aviatorService } from '@/src/shared/services/api/aviator/aviator.api';

export const aviatorKeys = {
    all: ['aviator'] as const,
    status: () => [...aviatorKeys.all, 'status'] as const,
} as const;

// Statut du bot, rafraîchi automatiquement pour suivre l'état réel côté serveur
export function useAviatorStatus() {
    return useQuery({
        queryKey: aviatorKeys.status(),
        queryFn: () => aviatorService.getStatus(),
        staleTime: 5 * 1000,
        refetchInterval: 10 * 1000,
        retry: (failureCount, error: any) => {
            if (error?.message?.includes('401') || error?.message?.includes('403')) {
                return false;
            }
            return failureCount < 2;
        },
    });
}

export function useStartAviatorBot() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ stake, cashoutMultiplier }: { stake: number; cashoutMultiplier: number }) =>
            aviatorService.start(stake, cashoutMultiplier),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: aviatorKeys.status() });
        },
    });
}

export function useStopAviatorBot() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => aviatorService.stop(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: aviatorKeys.status() });
        },
    });
}
