// src/components/molecules/SuccessModal.tsx
import React from 'react';
import {
    Modal,
    View,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Dimensions,
} from 'react-native';
import { useTheme } from '@/src/shared/context/ThemeContext';

import Text from '@/src/components/atoms/Text';
import Button from '@/src/components/atoms/Button';
import { spacing, borderRadius, shadows } from '@/src/styles';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface SuccessModalProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    betId?: string;
    potentialPayout?: string;
    customMessage?: string;
    type?: 'success' | 'info';
}

export default function SuccessModal({
                                         visible,
                                         onClose,
                                         title,
                                         betId,
                                         potentialPayout,
                                         customMessage,
                                         type = 'success',
                                     }: SuccessModalProps) {
    const { colors } = useTheme();

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={[
                            styles.modalContainer,
                            { backgroundColor: colors.background },
                            shadows.lg
                        ]}>
                            {/* Header simple avec indicateur de succès */}
                            <View style={styles.header}>
                                <View style={[
                                    styles.successIndicator,
                                    { backgroundColor: type === 'success' ? colors.success : colors.primary }
                                ]}>
                                    <Text variant="heading3" style={{ color: '#ffffff' }}>
                                        {type === 'success' ? '✓' : 'ℹ'}
                                    </Text>
                                </View>
                            </View>

                            {/* Contenu */}
                            <View style={styles.content}>
                                <Text variant="heading3" color="text" align="center" style={styles.title}>
                                    {title}
                                </Text>

                                {customMessage && (
                                    <Text variant="body" color="textSecondary" align="center" style={styles.message}>
                                        {customMessage}
                                    </Text>
                                )}

                                {/* Détails du pari */}
                                {(betId || potentialPayout) && (
                                    <View style={[
                                        styles.detailsContainer,
                                        { backgroundColor: colors.surface }
                                    ]}>
                                        {betId && (
                                            <View style={styles.detailRow}>
                                                <Text variant="caption" color="textSecondary">
                                                    ID du pari:
                                                </Text>
                                                <Text variant="body" weight="bold" color="text">
                                                    {betId}
                                                </Text>
                                            </View>
                                        )}

                                        {potentialPayout && (
                                            <View style={styles.detailRow}>
                                                <Text variant="caption" color="textSecondary">
                                                    Gain potentiel:
                                                </Text>
                                                <Text variant="heading3" color="success">
                                                    {potentialPayout}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                )}
                            </View>

                            {/* Action */}
                            <View style={styles.actions}>
                                <Button
                                    title="Parfait !"
                                    onPress={onClose}
                                    variant="primary"
                                    size="md"
                                    style={styles.actionButton}
                                />
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
    },
    modalContainer: {
        width: '100%',
        maxWidth: 400,
        borderRadius: borderRadius.xl,
        paddingVertical: spacing.xl,
        paddingHorizontal: spacing.lg,
        maxHeight: screenHeight * 0.8,
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    successIndicator: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        marginBottom: spacing.xl,
    },
    title: {
        marginBottom: spacing.md,
    },
    message: {
        lineHeight: 24,
        marginBottom: spacing.lg,
    },
    detailsContainer: {
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        gap: spacing.md,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    actions: {
        width: '100%',
    },
    actionButton: {
        width: '100%',
    },
});