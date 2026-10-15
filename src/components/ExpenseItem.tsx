import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Modal, Image } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Expense, CATEGORY_ICONS } from '@/types/expense';
import { GlassCard } from './GlassCard';
import { LiquidGlassColors, Spacing } from '@/constants/theme';

interface ExpenseItemProps {
  expense: Expense;
  index: number;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

export const ExpenseItem: React.FC<ExpenseItemProps> = ({
  expense,
  index,
  onEdit,
  onDelete,
}) => {
  const [showImageModal, setShowImageModal] = useState(false);

  const expenseDate = new Date(expense.date);
  const formattedDate = expenseDate.toLocaleDateString('es-EC', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(expense.amount);

  const confirmDelete = () => {
    Alert.alert(
      'Eliminar gasto',
      `¿Deseas eliminar el gasto de ${formattedAmount} en ${expense.category}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => onDelete(expense.id) },
      ]
    );
  };

  return (
    <>
      <Animated.View entering={FadeInDown.delay(index * 50).springify()} style={styles.container}>
        <GlassCard>
          <View style={styles.content}>
            <View style={styles.leftSection}>
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>{CATEGORY_ICONS[expense.category]}</Text>
              </View>
              <View style={styles.infoContainer}>
                <Text style={styles.category}>{expense.category}</Text>
                {expense.description ? (
                  <Text style={styles.description} numberOfLines={1}>
                    {expense.description}
                  </Text>
                ) : null}
                {expense.invoiceUri && (
                  <TouchableOpacity onPress={() => setShowImageModal(true)}>
                    <Text style={styles.invoiceTag}>📎 Ver comprobante</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={styles.rightSection}>
              <Text style={styles.amount}>{formattedAmount}</Text>
              <Text style={styles.date}>{formattedDate}</Text>
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => onEdit(expense)} style={styles.actionBtn}>
                  <Text style={styles.actionIcon}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={confirmDelete} style={styles.actionBtn}>
                  <Text style={styles.actionIcon}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </GlassCard>
      </Animated.View>

      {/* Modal visor de la factura */}
      {expense.invoiceUri && (
        <Modal visible={showImageModal} transparent animationType="fade">
          <View style={styles.imageModalOverlay}>
            <View style={styles.imageModalContainer}>
              <Text style={styles.modalInvoiceTitle}>Factura / Comprobante</Text>
              <Image source={{ uri: expense.invoiceUri }} style={styles.modalImage} />
              <TouchableOpacity
                style={styles.closeModalBtn}
                onPress={() => setShowImageModal(false)}
              >
                <Text style={styles.closeModalText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: Spacing.two },
  content: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  leftSection: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 107, 157, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.two,
  },
  icon: { fontSize: 22 },
  infoContainer: { flex: 1 },
  category: {
    fontSize: 16,
    fontWeight: '700',
    color: LiquidGlassColors.glassText,
    marginBottom: 2,
  },
  description: { fontSize: 13, color: LiquidGlassColors.glassTextSecondary },
  invoiceTag: {
    fontSize: 12,
    color: LiquidGlassColors.secondary,
    fontWeight: '600',
    marginTop: 4,
  },
  rightSection: { alignItems: 'flex-end' },
  amount: {
    fontSize: 17,
    fontWeight: 'bold',
    color: LiquidGlassColors.glassText,
    marginBottom: 2,
  },
  date: { fontSize: 12, color: LiquidGlassColors.glassTextSecondary },
  actions: { flexDirection: 'row', marginTop: 6, gap: 10 },
  actionBtn: { padding: 4 },
  actionIcon: { fontSize: 16 },
  imageModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  imageModalContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderWidth: 1,
    borderColor: LiquidGlassColors.glassBorder,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  modalInvoiceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: LiquidGlassColors.glassText,
    marginBottom: 12,
  },
  modalImage: { width: '100%', height: 320, borderRadius: 12, resizeMode: 'contain' },
  closeModalBtn: {
    marginTop: 16,
    backgroundColor: LiquidGlassColors.secondary,
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 20,
  },
  closeModalText: { color: LiquidGlassColors.glassTextLight, fontWeight: 'bold' },
});