// src/components/atoms/PhoneInput.tsx
// Champ numéro malgache : préfixe « +261 » fixe, l'utilisateur ne saisit que les 9 chiffres.
import React from 'react';
import { TextInput, Text, View, StyleSheet } from 'react-native';
import { useTheme } from '@/src/shared/context/ThemeContext';
import { spacing, typography, borderRadius } from '@/src/styles';
import { normalizeMgPhone, formatMgPhone } from '@/src/shared/utils/phone';

interface PhoneInputProps {
    label?: string;
    /** Les 9 chiffres nationaux (sans 0 ni +261) */
    value: string;
    onChangeDigits: (digits: string) => void;
    error?: string;
    helperText?: string;
    required?: boolean;
    onSubmitEditing?: () => void;
}

export default function PhoneInput({
                                       label,
                                       value,
                                       onChangeDigits,
                                       error,
                                       helperText,
                                       required = false,
                                       onSubmitEditing,
                                   }: PhoneInputProps) {
    const { colors } = useTheme();
    const borderColor = error ? colors.error : colors.border;

    return (
        <View style={styles.container}>
            {!!label && (
                <Text style={[styles.label, { color: error ? colors.error : colors.text }]}>
                    {label}
                    {required && <Text style={{ color: colors.error }}> *</Text>}
                </Text>
            )}

            <View style={[styles.row, { borderColor, backgroundColor: colors.background }]}>
                <View style={[styles.prefix, { borderRightColor: borderColor, backgroundColor: colors.surface }]}>
                    <Text style={[styles.prefixText, { color: colors.text }]}>🇲🇬 +261</Text>
                </View>

                <TextInput
                    style={[styles.input, { color: colors.text }]}
                    value={formatMgPhone(value)}
                    onChangeText={(text) => onChangeDigits(normalizeMgPhone(text))}
                    placeholder="xx xx xxx xx"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="phone-pad"
                    autoComplete="tel"
                    textContentType="telephoneNumber"
                    autoCorrect={false}
                    maxLength={12} // « xx xx xxx xx » = 9 chiffres + 3 espaces
                    returnKeyType="next"
                    onSubmitEditing={onSubmitEditing}
                />
            </View>

            {(!!error || !!helperText) && (
                <Text style={[styles.helper, { color: error ? colors.error : colors.textSecondary }]}>
                    {error || helperText}
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.md,
    },
    label: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.bold,
        marginBottom: spacing.xs,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: borderRadius.md,
        overflow: 'hidden',
        minHeight: 48,
    },
    prefix: {
        paddingHorizontal: spacing.md,
        alignSelf: 'stretch',
        justifyContent: 'center',
        borderRightWidth: 1,
    },
    prefixText: {
        fontSize: typography.fontSize.md,
        fontFamily: typography.fontFamily.bold,
    },
    input: {
        flex: 1,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        fontSize: typography.fontSize.md,
        fontFamily: typography.fontFamily.regular,
    },
    helper: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.regular,
        marginTop: spacing.xs,
    },
});
