// src/components/molecules/ConfirmationModal.tsx
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

interface ConfirmationModalProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    message: string;
    confirmText: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel?: () => void;
    type?: 'info' | 'warning' | 'success' | 'error';
    loading?: boolean;
    confirmButtonVariant?: 'primary' | 'secondary' | 'outline';
}

export default function ConfirmationModal({
                                              visible,
                                              onClose,
                                              title,
                                              message,
                                              confirmText,
                                              cancelText = 'Annuler',
                                              onConfirm,
                                              onCancel,
                                              type = 'info',
                                              loading = false,
                                              confirmButtonVariant = 'primary',
                                          }: ConfirmationModalProps) {
    const { colors } = useTheme();

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        } else {
            onClose();
        }
    };

    const handleConfirm = () => {
        onConfirm();
    };

    const getIconColorByType = () => {
        switch (type) {
            case 'warning':
                return colors.warning;
            case 'success':
                return colors.success;
            case 'error':
                return colors.error;
            default:
                return colors.primary;
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
            onRequestClose={handleCancel}
        >
            <TouchableWithoutFeedback onPress={handleCancel}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={[
                            styles.modalContainer,
                            { backgroundColor: colors.background },
                            shadows.lg
                        ]}>
                            {/* Header simple */}
                            <View style={styles.header}>
                                {/* Bouton de fermeture */}
                                <TouchableOpacity
                                    style={styles.closeButton}
                                    onPress={handleCancel}
                                    activeOpacity={0.7}
                                >
                                    <Text variant="heading3" color="textSecondary">✕</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Contenu */}
                            <View style={styles.content}>
                                <Text variant="heading3" color="text" align="center" style={styles.title}>
                                    {title}
                                </Text>

                                <Text variant="body" color="textSecondary" align="center" style={styles.message}>
                                    {message}
                                </Text>
                            </View>

                            {/* Actions */}
                            <View style={styles.actions}>
                                <Button
                                    title={cancelText}
                                    onPress={handleCancel}
                                    variant="outline"
                                    size="md"
                                    disabled={loading}
                                    style={styles.cancelButton}
                                />

                                <Button
                                    title={confirmText}
                                    onPress={handleConfirm}
                                    variant={confirmButtonVariant}
                                    size="md"
                                    loading={loading}
                                    disabled={loading}
                                    style={styles.confirmButton}
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
        alignItems: 'flex-end',
        marginBottom: spacing.md,
        position: 'relative',
    },
    closeButton: {
        position: 'absolute',
        top: -spacing.sm,
        right: -spacing.sm,
        padding: spacing.sm,
    },
    content: {
        marginBottom: spacing.xl,
    },
    title: {
        marginBottom: spacing.md,
    },
    message: {
        lineHeight: 24,
    },
    actions: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    cancelButton: {
        flex: 1,
    },
    confirmButton: {
        flex: 1,
    },
});