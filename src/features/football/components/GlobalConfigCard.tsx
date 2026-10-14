// src/features/football/components/GlobalConfigCard.tsx
// Admin seulement : cotes et limites imposées à TOUS les utilisateurs (la mise reste personnelle).
// Même design et même fonctionnement que le formulaire personnel de ConfigurationTab :
// configuration actuelle, formulaire en cartes, Réinitialiser / Sauvegarder, fenêtres de confirmation.
import React, { useEffect, useState } from 'react';
import { View, Keyboard } from 'react-native';
import { useTheme } from '@/src/shared/context/ThemeContext';
import {
    useGroloGlobalConfig,
    useUpdateGroloGlobalConfig,
    useResetGroloGlobalConfig,
} from '@/src/shared/hooks/grolo/useGroloQueries';
import { useScreenSize, styles } from '@/src/features/football/components/tabs/configTabShared';
import Button from '@/src/components/atoms/Button';
import Input from '@/src/components/atoms/Input';
import Text from '@/src/components/atoms/Text';
import ConfirmationModal from '@/src/components/molecules/ConfirmationModal';

type Form = { min_odds: string; max_odds: string; max_matches: string; max_total_odds: string };
const EMPTY_FORM: Form = { min_odds: '', max_odds: '', max_matches: '', max_total_odds: '' };

export default function GlobalConfigCard() {
    const { colors } = useTheme();
    const screenSize = useScreenSize();

    const { data, isLoading, error: loadError } = useGroloGlobalConfig(true);
    const updateMutation = useUpdateGroloGlobalConfig();
    const resetMutation = useResetGroloGlobalConfig();
    const loading = updateMutation.isPending || resetMutation.isPending;

    const [formData, setFormData] = useState<Form>(EMPTY_FORM);
    const [lastUpdateTime, setLastUpdateTime] = useState<string | null>(null);

    // Modal states (comme ConfigurationTab)
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [modalData, setModalData] = useState({
        title: '',
        message: '',
        confirmText: '',
        onConfirm: () => {},
    });

    const toForm = (c: NonNullable<typeof data>['constraints']): Form => ({
        min_odds: String(c.min_odds),
        max_odds: String(c.max_odds),
        max_matches: String(c.max_matches),
        max_total_odds: String(c.max_total_odds),
    });

    useEffect(() => {
        if (data) {
            setFormData(toForm(data.constraints));
        }
    }, [data]);

    // Modifications non enregistrées ?
    const hasChanges = !!data && (
        parseFloat(formData.min_odds) !== data.constraints.min_odds ||
        parseFloat(formData.max_odds) !== data.constraints.max_odds ||
        parseInt(formData.max_matches, 10) !== data.constraints.max_matches ||
        parseFloat(formData.max_total_odds) !== data.constraints.max_total_odds
    );

    const handleInputChange = (field: keyof Form, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const showError = (message: string) => {
        setModalData({
            title: 'Erreur de validation',
            message,
            confirmText: 'Compris',
            onConfirm: () => setShowErrorModal(false),
        });
        setShowErrorModal(true);
    };

    const validateForm = (): string | null => {
        const min = parseFloat(formData.min_odds);
        const max = parseFloat(formData.max_odds);
        const matches = parseInt(formData.max_matches, 10);
        const total = parseFloat(formData.max_total_odds);

        if (!(min >= 1 && min <= 3)) return 'La cote minimale doit être entre 1 et 3';
        if (!(max >= 1 && max <= 5)) return 'La cote maximale doit être entre 1 et 5';
        if (min >= max) return 'La cote minimale doit être inférieure à la cote maximale';
        if (!(matches >= 1 && matches <= 50)) return 'Le nombre maximum de matchs doit être entre 1 et 50';
        if (!(total >= 1000 && total <= 100000)) return 'La cote totale maximum doit être entre 1 000 et 100 000';
        return null;
    };

    const handleSave = () => {
        Keyboard.dismiss();

        const validationError = validateForm();
        if (validationError) {
            showError(validationError);
            return;
        }

        setModalData({
            title: 'Confirmer les modifications',
            message: 'Êtes-vous sûr de vouloir sauvegarder ces modifications pour TOUS les utilisateurs ?',
            confirmText: 'Sauvegarder',
            onConfirm: handleConfirmSave,
        });
        setShowConfirmModal(true);
    };

    const showResult = (message: string, updatedAt?: string | null) => {
        if (updatedAt) setLastUpdateTime(updatedAt);
        setModalData({
            title: 'Réglages mis à jour',
            message,
            confirmText: 'Parfait !',
            onConfirm: () => setShowSuccessModal(false),
        });
        setShowSuccessModal(true);
    };

    const showFailure = (err: unknown) => {
        setModalData({
            title: 'Erreur',
            message: err instanceof Error ? err.message : 'Erreur lors de la sauvegarde',
            confirmText: 'Compris',
            onConfirm: () => setShowErrorModal(false),
        });
        setShowErrorModal(true);
    };

    const handleConfirmSave = async () => {
        setShowConfirmModal(false);
        try {
            const result = await updateMutation.mutateAsync({
                min_odds: parseFloat(formData.min_odds),
                max_odds: parseFloat(formData.max_odds),
                max_matches: parseInt(formData.max_matches, 10),
                max_total_odds: parseFloat(formData.max_total_odds),
            });
            showResult(
                result.changes_made.length
                    ? `Modifications sauvegardées pour tous les utilisateurs !\n\nChangements:\n${result.changes_made.join('\n')}`
                    : 'Aucun changement : ces valeurs étaient déjà appliquées.',
                result.metadata?.updated_at
            );
        } catch (err) {
            showFailure(err);
        }
    };

    // Réinitialiser : annule les modifications non enregistrées (comme le formulaire personnel)
    const handleReset = () => {
        Keyboard.dismiss();
        if (data) {
            setFormData(toForm(data.constraints));
        }
    };

    // Admin seulement : remet les réglages COMMUNS aux valeurs par défaut (les mises ne bougent pas)
    const handleRestoreDefaults = () => {
        Keyboard.dismiss();
        setModalData({
            title: 'Remettre les valeurs par défaut',
            message: 'Les cotes et limites de TOUS les utilisateurs reviendront aux valeurs par défaut. Les mises personnelles ne changent pas.',
            confirmText: 'Remettre par défaut',
            onConfirm: handleConfirmRestoreDefaults,
        });
        setShowConfirmModal(true);
    };

    const handleConfirmRestoreDefaults = async () => {
        setShowConfirmModal(false);
        try {
            const result = await resetMutation.mutateAsync();
            showResult(
                result.changes_made.length
                    ? `Valeurs par défaut rétablies pour tous les utilisateurs !\n\nChangements:\n${result.changes_made.join('\n')}`
                    : 'Les réglages étaient déjà aux valeurs par défaut.',
                result.metadata?.updated_at
            );
        } catch (err) {
            showFailure(err);
        }
    };

    const headingVariant = screenSize.isDesktop ? 'heading2' : 'heading3';

    const renderCurrentConfig = () => data && (
        <View style={[styles.configSection, screenSize.isDesktop && styles.desktopConfigSection]}>
            <View style={[styles.currentConfigGrid, screenSize.isDesktop && styles.desktopCurrentConfigGrid]}>
                <View style={[styles.configItem, screenSize.isDesktop && styles.desktopConfigItem]}>
                    <Text variant="caption" color="textSecondary">Cotes</Text>
                    <Text variant={screenSize.isDesktop ? 'heading3' : 'body'} weight="bold" color="text">
                        {data.constraints.min_odds} - {data.constraints.max_odds}
                    </Text>
                </View>

                <View style={[styles.configItem, screenSize.isDesktop && styles.desktopConfigItem]}>
                    <Text variant="caption" color="textSecondary">Max Matchs</Text>
                    <Text variant={screenSize.isDesktop ? 'heading3' : 'body'} weight="bold" color="text">
                        {data.constraints.max_matches}
                    </Text>
                </View>

                <View style={[styles.configItem, screenSize.isDesktop && styles.desktopConfigItem]}>
                    <Text variant="caption" color="textSecondary">Cote totale max</Text>
                    <Text variant={screenSize.isDesktop ? 'heading3' : 'body'} weight="bold" color="text">
                        {data.constraints.max_total_odds.toLocaleString()}
                    </Text>
                </View>
            </View>

            <View style={styles.metadataContainer}>
                <Text variant="caption" color="textSecondary">
                    Dernière mise à jour: {lastUpdateTime
                    ? new Date(lastUpdateTime).toLocaleString('fr-FR')
                    : (data.metadata?.updated_at
                        ? new Date(data.metadata.updated_at).toLocaleString('fr-FR')
                        : 'Valeurs par défaut (jamais modifiées)')}
                </Text>
            </View>
        </View>
    );

    const oddsFields = (
        <>
            <Text variant="body" weight="bold" color="text">Contraintes de Cotes</Text>
            <Input
                label="Cote minimale"
                value={formData.min_odds}
                onChangeText={(value) => handleInputChange('min_odds', value)}
                keyboardType="decimal-pad"
                placeholder="1.2"
                helperText="Entre 1.0 et 3.0"
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
            />
            <Input
                label="Cote maximale"
                value={formData.max_odds}
                onChangeText={(value) => handleInputChange('max_odds', value)}
                keyboardType="decimal-pad"
                placeholder="1.5"
                helperText="Entre 1.0 et 5.0"
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
            />
        </>
    );

    const limitFields = (
        <>
            <Text variant="body" weight="bold" color="text">Limites</Text>
            <Input
                label="Nombre maximum de matchs"
                value={formData.max_matches}
                onChangeText={(value) => handleInputChange('max_matches', value)}
                keyboardType="numeric"
                placeholder="40"
                helperText="Entre 1 et 50 matchs"
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
            />
            <Input
                label="Cote totale maximum"
                value={formData.max_total_odds}
                onChangeText={(value) => handleInputChange('max_total_odds', value)}
                keyboardType="numeric"
                placeholder="70000"
                helperText="Entre 1 000 et 100 000"
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
            />
        </>
    );

    const renderForm = () => (
        <View style={[styles.section, screenSize.isDesktop && styles.desktopSection]}>
            <Text variant={headingVariant} color="text">Modifier les réglages communs</Text>

            {screenSize.isDesktop ? (
                <View style={styles.desktopFormLayout}>
                    <View style={styles.desktopFormColumn}>
                        <View style={[styles.formSection, styles.desktopFormCard]}>{oddsFields}</View>
                    </View>
                    <View style={styles.desktopFormColumn}>
                        <View style={[styles.formSection, styles.desktopFormCard]}>{limitFields}</View>
                    </View>
                </View>
            ) : (
                <>
                    <View style={styles.formSection}>{oddsFields}</View>
                    <View style={styles.formSection}>{limitFields}</View>
                </>
            )}

            {/* Action Buttons */}
            <View style={[styles.actionButtons, screenSize.isDesktop && styles.desktopActionButtons]}>
                <Button
                    title="Réinitialiser"
                    onPress={handleReset}
                    variant="outline"
                    size={screenSize.isDesktop ? 'md' : 'sm'}
                    disabled={!hasChanges || loading}
                    style={screenSize.isDesktop ? { minWidth: 150 } : { flex: 1 }}
                />

                <Button
                    title={updateMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder'}
                    onPress={handleSave}
                    variant="outline"
                    size={screenSize.isDesktop ? 'md' : 'sm'}
                    disabled={!hasChanges || loading}
                    loading={updateMutation.isPending}
                    style={{
                        borderColor: hasChanges ? colors.success : colors.textSecondary,
                        ...(screenSize.isDesktop ? { minWidth: 150 } : { flex: 1 }),
                    }}
                    textStyle={{ color: hasChanges ? colors.success : colors.textSecondary }}
                />
            </View>

            {/* Admin seulement : retour aux valeurs par défaut pour tous les utilisateurs */}
            <View style={[styles.actionButtons, screenSize.isDesktop && styles.desktopActionButtons]}>
                <Button
                    title={resetMutation.isPending ? 'Réinitialisation...' : 'Remettre les valeurs par défaut'}
                    onPress={handleRestoreDefaults}
                    variant="outline"
                    size={screenSize.isDesktop ? 'md' : 'sm'}
                    disabled={loading}
                    loading={resetMutation.isPending}
                    style={{ borderColor: colors.warning, ...(screenSize.isDesktop ? {} : { flex: 1 }) }}
                    textStyle={{ color: colors.warning }}
                />
            </View>
        </View>
    );

    return (
        <>
            <View style={[styles.section, screenSize.isDesktop && styles.desktopSection]}>
                <Text variant={headingVariant} color="text">Réglages pour tous les utilisateurs</Text>
                <Text variant="caption" color="textSecondary">
                    Ces cotes et limites s'appliquent à tous les utilisateurs. Chacun ne règle que sa mise.
                    Vos réglages personnels ci-dessus ne servent que pour vos propres paris.
                </Text>

                {isLoading ? (
                    <Text variant="body" color="textSecondary">Chargement...</Text>
                ) : loadError ? (
                    <Text variant="caption" color="error">
                        {loadError instanceof Error ? loadError.message : 'Impossible de charger ces réglages'}
                    </Text>
                ) : (
                    <>
                        {renderCurrentConfig()}
                        {renderForm()}
                    </>
                )}
            </View>

            {/* Modals */}
            <ConfirmationModal
                visible={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                title={modalData.title}
                message={modalData.message}
                confirmText={modalData.confirmText}
                onConfirm={modalData.onConfirm}
                type="warning"
                loading={loading}
            />

            <ConfirmationModal
                visible={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                title={modalData.title}
                message={modalData.message}
                confirmText={modalData.confirmText}
                onConfirm={modalData.onConfirm}
                type="success"
            />

            <ConfirmationModal
                visible={showErrorModal}
                onClose={() => setShowErrorModal(false)}
                title={modalData.title}
                message={modalData.message}
                confirmText={modalData.confirmText}
                onConfirm={modalData.onConfirm}
                type="error"
            />
        </>
    );
}
