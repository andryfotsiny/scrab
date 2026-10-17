// MatchCountSelector.tsx - choix du nombre de matchs (20 / 40 / personnalisé)
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useTheme } from '@/src/shared/context/ThemeContext';
import { useUpdateGroloConfig } from '@/src/shared/hooks/grolo/useGroloQueries';
import { FootballConfig } from '@/src/shared/services/types/grolo.type';
import Button from '@/src/components/atoms/Button';
import Text from '@/src/components/atoms/Text';
import { spacing, typography, borderRadius } from '@/src/styles';

export type MatchMode = '20' | '40' | 'custom';
export const DEFAULT_MATCH_MODE: MatchMode = '20';
export const CUSTOM_MIN = 1;

/** Retrouve le mode choisi à partir du nombre de matchs enregistré (source de vérité : la configuration). */
function modeFromCount(count: number): { mode: MatchMode; customCount: number | null } {
    if (count === 20) return { mode: '20', customCount: null };
    if (count === 40) return { mode: '40', customCount: null };
    return { mode: 'custom', customCount: count };
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
    const [customCount, setCustomCount] = useState<number | null>(initial?.customCount ?? null);
    const [applying, setApplying] = useState(false);
    const [error, setError] = useState('');
    const synced = useRef(!!config);

    // Config chargée après le premier rendu : reprendre le choix enregistré (une seule fois)
    useEffect(() => {
        if (synced.current || !config) return;
        synced.current = true;
        const restored = modeFromCount(config.constraints.max_matches);
        setMode(restored.mode);
        setCustomCount(restored.customCount);
    }, [config]);

    const targetCount = mode === 'custom' ? customCount : Number(mode);
    const maxAllowed = config?.constraints.max_matches_limit;

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

    const selectMode = async (next: '20' | '40') => {
        if (applying) return;

        const previous = { mode, customCount };
        setMode(next);
        setCustomCount(null);

        const saved = await apply(Number(next));
        if (!saved) {
            // Refusé par le serveur (ex. au-dessus du maximum de l'admin) : revenir au choix précédent
            setMode(previous.mode);
            setCustomCount(previous.customCount);
        }
    };

    const applyCustom = async (count: number) => {
        if (applying) return;

        const previous = { mode, customCount };
        setMode('custom');
        setCustomCount(count);

        const saved = await apply(count);
        if (!saved) {
            setMode(previous.mode);
            setCustomCount(previous.customCount);
        }
    };

    return { mode, customCount, targetCount, applying, error, maxAllowed, selectMode, applyCustom };
}

interface Props {
    mode: MatchMode;
    customCount: number | null;
    targetCount: number | null;
    applying: boolean;
    error: string;
    maxAllowed?: number;
    onSelect: (mode: '20' | '40') => void;
    onApplyCustom: (count: number) => void;
    availableMatches?: number;
}

export default function MatchCountSelector({
                                                mode, customCount, targetCount, applying, error, maxAllowed,
                                                onSelect, onApplyCustom, availableMatches,
                                            }: Props) {
    const { colors } = useTheme();
    // Révéler le champ de saisie : s'ouvre si "Personnalisé" est déjà le choix enregistré, mais reste
    // un état purement local — taper un nombre ne l'enregistre pas tant qu'on n'a pas validé
    const [customOpen, setCustomOpen] = useState(mode === 'custom');
    const [customText, setCustomText] = useState(customCount ? String(customCount) : '');
    const maxLabel = maxAllowed ?? 50;

    useEffect(() => {
        if (mode === 'custom' && customCount) {
            setCustomText(String(customCount));
        }
    }, [mode, customCount]);

    const [localError, setLocalError] = useState('');

    const handleCustomSubmit = () => {
        const n = parseInt(customText, 10);
        if (!n || n < CUSTOM_MIN) {
            setLocalError(`Entrez un nombre d'au moins ${CUSTOM_MIN}`);
            return;
        }
        if (maxAllowed && n > maxAllowed) {
            setLocalError(`Le maximum autorisé est de ${maxAllowed} matchs`);
            return;
        }
        setLocalError('');
        onApplyCustom(n);
    };

    const options: { mode: '20' | '40'; label: string }[] = [
        { mode: '20', label: '20 matchs' },
        { mode: '40', label: '40 matchs' },
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
                        onPress={() => {
                            setCustomOpen(false);
                            onSelect(o.mode);
                        }}
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

            <TouchableOpacity
                style={styles.row}
                onPress={() => setCustomOpen(true)}
                disabled={applying}
                accessibilityRole="radio"
                accessibilityState={{ selected: mode === 'custom', disabled: applying }}
            >
                <View style={[styles.outer, { borderColor: mode === 'custom' ? colors.primary : colors.textSecondary }]}>
                    {mode === 'custom' && <View style={[styles.inner, { backgroundColor: colors.primary }]} />}
                </View>
                <Text variant="body" color="text">
                    Personnalisé{mode === 'custom' && customCount ? ` : ${customCount} matchs` : ''}
                </Text>
            </TouchableOpacity>

            {customOpen && (
                <View style={styles.customRow}>
                    <TextInput
                        style={[styles.customInput, { borderColor: colors.border, color: colors.text }]}
                        value={customText}
                        onChangeText={(v) => { setCustomText(v.replace(/[^0-9]/g, '')); setLocalError(''); }}
                        placeholder={`1 à ${maxLabel}`}
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="number-pad"
                        returnKeyType="done"
                        onSubmitEditing={handleCustomSubmit}
                        editable={!applying}
                    />
                    <Button
                        title="Valider"
                        onPress={handleCustomSubmit}
                        variant="primary"
                        size="sm"
                        disabled={applying || !customText}
                    />
                </View>
            )}
            {!!localError && (
                <Text variant="caption" color="error" style={styles.status}>{localError}</Text>
            )}

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
    customRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginLeft: 30, // aligné avec le texte des options au-dessus (22px de cercle + 8px d'écart)
        marginTop: spacing.xs,
        marginBottom: spacing.xs,
    },
    customInput: {
        borderWidth: 1,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        fontSize: typography.fontSize.md,
        fontFamily: typography.fontFamily.regular,
        width: 100,
    },
});
