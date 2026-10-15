import React, { useState, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MonthlyHeader } from '@/components/MonthlyHeader';
import { ExpenseItem } from '@/components/ExpenseItem';
import { AddExpenseModal } from '@/components/AddExpenseModal';
import { useExpenses } from '@/context/ExpenseContext';
import { Expense } from '@/types/expense';
import { LiquidGlassColors, Spacing } from '@/constants/theme';
import { GlassCard } from '@/components/GlassCard';

type SortOrder = 'recent' | 'highest';

export default function HomeScreen() {
  const { getCurrentMonthExpenses, isLoading, removeExpense } = useExpenses();
  const [modalVisible, setModalVisible] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [sortBy, setSortBy] = useState<SortOrder>('recent');

  const expenses = getCurrentMonthExpenses();

  // Filtrado y ordenamiento: por defecto fecha reciente o por montos más altos
  const sortedExpenses = useMemo(() => {
    const list = [...expenses];
    if (sortBy === 'highest') {
      return list.sort((a, b) => b.amount - a.amount);
    }
    return list.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [expenses, sortBy]);

  const handleOpenEdit = (expense: Expense) => {
    setExpenseToEdit(expense);
    setModalVisible(true);
  };

  const handleOpenCreate = () => {
    setExpenseToEdit(null);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <LinearGradient
        colors={['#FFF5F9', '#FFE8F0', '#FFF9FC']}
        style={StyleSheet.absoluteFill}
      />
      <View pointerEvents="none" style={styles.decorations}>
        <View style={[styles.orb, styles.orbTop]} />
        <View style={[styles.orb, styles.orbBottom]} />
      </View>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Text style={styles.appTitle}>Gastos Poliestudiante</Text>

          <MonthlyHeader />

          {/* Barra de Ordenamiento */}
          <GlassCard style={styles.filterCard}>
            <View style={styles.filterBar}>
              <Text style={styles.filterTitle}>
                {sortBy === 'highest' ? 'Gastos más altos' : 'Más recientes'}
              </Text>
              <TouchableOpacity
                style={[
                  styles.sortButton,
                  sortBy === 'highest' && styles.sortButtonActive,
                ]}
                onPress={() =>
                  setSortBy((prev) => (prev === 'highest' ? 'recent' : 'highest'))
                }
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.sortButtonText,
                    sortBy === 'highest' && styles.sortButtonTextActive,
                  ]}
                >
                  {sortBy === 'highest' ? '↓ Mayor monto' : '↕ Ordenar'}
                </Text>
              </TouchableOpacity>
            </View>
          </GlassCard>

          {isLoading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="large" color={LiquidGlassColors.primary} />
            </View>
          ) : sortedExpenses.length === 0 ? (
            <GlassCard style={styles.emptyCard}>
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>💸</Text>
                <Text style={styles.emptyTitle}>No hay gastos registrados</Text>
                <Text style={styles.emptyText}>
                  Presiona el botón + para registrar tu primer gasto
                </Text>
              </View>
            </GlassCard>
          ) : (
            <FlatList
              data={sortedExpenses}
              keyExtractor={(item) => item.id}
              renderItem={({ item, index }) => (
                <ExpenseItem
                  expense={item}
                  index={index}
                  onEdit={handleOpenEdit}
                  onDelete={removeExpense}
                />
              )}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

        {/* Botón flotante para agregar (+) */}
        <TouchableOpacity
          style={styles.fab}
          onPress={handleOpenCreate}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Agregar gasto"
        >
          <LinearGradient
            colors={[LiquidGlassColors.primary, LiquidGlassColors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fabGradient}
          >
            <Text style={styles.fabIcon}>+</Text>
          </LinearGradient>
        </TouchableOpacity>

        <AddExpenseModal
          visible={modalVisible}
          expenseToEdit={expenseToEdit}
          onClose={() => {
            setModalVisible(false);
            setExpenseToEdit(null);
          }}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF5F9' },
  safeArea: { flex: 1 },
  decorations: { ...StyleSheet.absoluteFill },
  orb: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 107, 157, 0.14)',
  },
  orbTop: { width: 240, height: 240, top: 50, right: -110 },
  orbBottom: {
    width: 200,
    height: 200,
    bottom: 110,
    left: -120,
    backgroundColor: 'rgba(196, 69, 105, 0.10)',
  },
  content: { flex: 1, paddingHorizontal: Spacing.four, paddingTop: Spacing.two },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: LiquidGlassColors.glassText,
    marginBottom: Spacing.three,
    textAlign: 'center',
  },
  filterCard: { marginBottom: Spacing.three },
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterTitle: {
    fontSize: 14,
    color: LiquidGlassColors.glassText,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  sortButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    paddingVertical: Spacing.one + 2,
    paddingHorizontal: Spacing.three,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: LiquidGlassColors.glassBorder,
  },
  sortButtonActive: {
    backgroundColor: LiquidGlassColors.glassBackgroundDark,
  },
  sortButtonText: {
    fontSize: 12,
    color: LiquidGlassColors.secondary,
    fontWeight: '600',
  },
  sortButtonTextActive: {
    color: LiquidGlassColors.glassText,
  },
  listContent: { paddingBottom: 100 },
  emptyCard: { marginTop: Spacing.three },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
  },
  emptyIcon: { fontSize: 56, marginBottom: Spacing.two },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: LiquidGlassColors.glassText,
    marginBottom: Spacing.one + 2,
  },
  emptyText: {
    fontSize: 14,
    color: LiquidGlassColors.glassTextSecondary,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
    overflow: 'hidden',
  },
  fabGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabIcon: {
    fontSize: 32,
    color: LiquidGlassColors.glassTextLight,
    fontWeight: '300',
    marginTop: -2,
  },
});