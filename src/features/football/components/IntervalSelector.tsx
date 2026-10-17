// IntervalSelector.tsx - choix de l'intervalle d'exécution automatique (3h / 5h / 8h / personnalisé)
// Même design que MatchCountSelector : sélection purement locale, appliquée seulement au clic sur Démarrer.
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useTheme } from '@/src/shared/context/ThemeContext';
import Button from '@/src/components/atoms/Button';
import Text from '@/src/components/atoms/Text';
import { spacing, typography, borderRadius } from '@/src/styles';

export const INTERVAL_MIN = 1;
export const INTERVAL_MAX = 24;
const PRESETS = [3, 5, 8];

interface Props {
    /** Intervalle actuellement choisi (local, pas encore démarré) */
    value: number;
    onChange: (hours: number) => void;
    disabled?: boolean;
}

export default function IntervalSelector({ value, onChange, disabled }: Props) {
    const { colors } = useTheme();
    const [customOpen, setCustomOpen] = useState(!PRESETS.includes(value));
    const [customText, setCustomText] = useState(!PRESETS.includes(value) ? String(value) : '');
    const [error, setError] = useState('');

    const handleCustomApply = () => {
        const n = parseInt(customText, 10);
        if (!n || n < INTERVAL_MIN || n > INTERVAL_MAX) {
            setError(`Entrez un nombre entre ${INTERVAL_MIN} et ${INTERVAL_MAX}`);
            return;
        }
        setError('');
        onChange(n);
    };

    return (
        <View>
            <Text variant="caption" color="textSecondary" style={styles.title}>
                Fréquence d'exécution
            </Text>
            {PRESETS.map((hours) => {
                const selected = !customOpen && value === hours;
                return (
                    <TouchableOpacity
                        key={hours}
                        style={styles.row}
                        onPress={() => { setCustomOpen(false); onChange(hours); }}
                        disabled={disabled}
                        accessibilityRole="radio"
                        accessibilityState={{ selected, disabled }}
                    >
                        <View style={[styles.outer, { borderColor: selected ? colors.primary : colors.textSecondary }]}>
                            {selected && <View style={[styles.inner, { backgroundColor: colors.primary }]} />}
                        </View>
                        <Text variant="body" color="text">Toutes les {hours} heures</Text>
                    </TouchableOpacity>
                );
            })}

            <TouchableOpacity
                style={styles.row}
                onPress={() => setCustomOpen(true)}
                disabled={disabled}
                accessibilityRole="radio"
                accessibilityState={{ selected: customOpen, disabled }}
            >
                <View style={[styles.outer, { borderColor: customOpen ? colors.primary : colors.textSecondary }]}>
                    {customOpen && <View style={[styles.inner, { backgroundColor: colors.primary }]} />}
                </View>
                <Text variant="body" color="text">
                    Personnalisé{customOpen && !PRESETS.includes(value) ? ` : toutes les ${value}h` : ''}
                </Text>
            </TouchableOpacity>

            {customOpen && (
                <View style={styles.customRow}>
                    <TextInput
                        style={[styles.customInput, { borderColor: colors.border, color: colors.text }]}
                        value={customText}
                        onChangeText={(v) => { setCustomText(v.replace(/[^0-9]/g, '')); setError(''); }}
                        placeholder={`${INTERVAL_MIN} à ${INTERVAL_MAX}`}
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="number-pad"
                        returnKeyType="done"
                        onSubmitEditing={handleCustomApply}
                        editable={!disabled}
                    />
                    <Button
                        title="Valider"
                        onPress={handleCustomApply}
                        variant="primary"
                        size="sm"
                        disabled={disabled || !customText}
                    />
                </View>
            )}
            {!!error && (
                <Text variant="caption" color="error" style={styles.status}>{error}</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    title: { marginTop: spacing.sm, marginBottom: spacing.xs },
    row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xs },
    outer: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
    inner: { width: 12, height: 12, borderRadius: 6 },
    status: { marginVertical: spacing.sm },
    customRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginLeft: 30,
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
