// MatchCountSelector.tsx - choix du nombre de matchs (20 / 40 / aléatoire 10-40)
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '@/src/shared/context/ThemeContext';
import { useUpdateGroloConfig } from '@/src/shared/hooks/grolo/useGroloQueries';
import { FootballConfig } from '@/src/shared/services/types/grolo.type';
import Text from '@/src/components/atoms/Text';
import { spacing } from '@/src/styles';

export type MatchMode = '20' | '40' | 'random';
export const DEFAULT_MATCH_MODE: MatchMode = '20';
export const RANDOM_MIN = 10;
export const RANDOM_MAX = 40;

const drawRandomCount = () => Math.floor(Math.random() * (RANDOM_MAX - RANDOM_MIN + 1)) + RANDOM_MIN;

/** Retrouve le mode choisi à partir du nombre de matchs enregistré (source de vérité : la configuration). */
function modeFromCount(count: number): { mode: MatchMode; randomCount: number | null } {
    if (count === 20) return { mode: '20', randomCount: null };
    if (count === 40) return { mode: '40', randomCount: null };
    // Tout autre nombre vient d'un tirage aléatoire (le tirage reste fixe jusqu'à une nouvelle sélection)
    return { mode: 'random', randomCount: count };
}

/**
 * Enregistre le nombre de matchs dans la config (`max_matches`), puis appelle `onApplied`
 * (ex. recharger la liste des matchs).
 *
 * Le choix survit au changement d'écran : à l'ouverture, le mode est relu depuis la configuration
 * enregistrée (le défaut de 20 matchs est posé côté serveur à la création du compte, il n'est plus
 * réappliqué à chaque ouverture).
 */
export function useMatchCount(config: FootballConfig | undefined, onApplied?: () => Promise<unknown>) {
    const updateConfig = useUpdateGroloConfig();
    const initial = config ? modeFromCount(config.constraints.max_matches) : null;
    const [mode, setMode] = useState<MatchMode>(initial?.mode ?? DEFAULT_MATCH_MODE);
    const [randomCount, setRandomCount] = useState<number | null>(initial?.randomCount ?? null);
    const [applying, setApplying] = useState(false);
    const [error, setError] = useState('');
    const synced = useRef(!!config);

    // Config chargée après le premier rendu : reprendre le choix enregistré (une seule fois)
    useEffect(() => {
        if (synced.current || !config) return;
        synced.current = true;
        const restored = modeFromCount(config.constraints.max_matches);
        setMode(restored.mode);
        setRandomCount(restored.randomCount);
    }, [config]);

    const targetCount = mode === 'random' ? randomCount : Number(mode);

    // Retourne true si le nombre de matchs a bien été enregistré
    const apply = useCallback(async (count: number): Promise<boolean> => {
        setApplying(true);
        setError('');
        try {
            await updateConfig.mutateAsync({ max_matches: count });
            await onApplied?.();
            return true;
        } catch (err) {
            setError((err instanceof Error && err.message) || 'Impossible de changer le nombre de matchs');
            return false;
        } finally {
            setApplying(false);
        }
    }, [updateConfig.mutateAsync, onApplied]);

    const selectMode = async (next: MatchMode) => {
        if (applying) return;

        const previous = { mode, randomCount };
        // Tirage unique à la sélection : le nombre reste fixe jusqu'à une nouvelle sélection
        const count = next === 'random' ? drawRandomCount() : Number(next);

        setMode(next);
        setRandomCount(next === 'random' ? count : null);

        const saved = await apply(count);
        if (!saved) {
            // Refusé par le serveur (ex. au-dessus du maximum de l'admin) : revenir au choix précédent
            setMode(previous.mode);
            setRandomCount(previous.randomCount);
        }
    };

    return { mode, randomCount, targetCount, applying, error, selectMode };
}

interface Props {
    mode: MatchMode;
    randomCount: number | null;
    targetCount: number | null;
    applying: boolean;
    error: string;
    onSelect: (mode: MatchMode) => void;
    availableMatches?: number;
}

export default function MatchCountSelector({ mode, randomCount, targetCount, applying, error, onSelect, availableMatches }: Props) {
    const { colors } = useTheme();

    const options: { mode: MatchMode; label: string }[] = [
        { mode: '20', label: '20 matchs' },
        { mode: '40', label: '40 matchs' },
        {
            mode: 'random',
            label: `Aléatoire (${RANDOM_MIN} à ${RANDOM_MAX})${mode === 'random' && randomCount ? ` : ${randomCount} matchs` : ''}`,
        },
    ];

    return (
        <View>
            <Text variant="caption" color="textSecondary" style={styles.title}>
                Nombre de matchs
            </Text>
            {options.map((o) => {
                const selected = mode === o.mode;
                return (
                    <TouchableOpacity
                        key={o.mode}
                        style={styles.row}
                        onPress={() => onSelect(o.mode)}
                        disabled={applying}
                        accessibilityRole="radio"
                        accessibilityState={{ selected, disabled: applying }}
                    >
                        <View style={[styles.outer, { borderColor: selected ? colors.primary : colors.textSecondary }]}>
                            {selected && <View style={[styles.inner, { backgroundColor: colors.primary }]} />}
                        </View>
                        <Text variant="body" color="text">{o.label}</Text>
                    </TouchableOpacity>
                );
            })}
            {applying && (
                <View style={styles.status}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text variant="caption" color="textSecondary">Chargement des {targetCount ?? ''} matchs...</Text>
                </View>
            )}
            {!applying && !!error && (
                <Text variant="caption" color="error" style={styles.status}>{error}</Text>
            )}
            {!applying && !error && !!targetCount && availableMatches !== undefined && availableMatches < targetCount && (
                <Text variant="caption" color="warning" style={styles.status}>
                    Seulement {availableMatches} matchs disponibles sur {targetCount} demandés
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    title: { marginTop: spacing.sm, marginBottom: spacing.xs },
    row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xs },
    outer: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
    inner: { width: 12, height: 12, borderRadius: 6 },
    status: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginVertical: spacing.sm },
});
