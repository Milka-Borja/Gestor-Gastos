import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { GlassCard } from './GlassCard';
import { LiquidGlassColors, Spacing } from '@/constants/theme';
import { useExpenses } from '@/context/ExpenseContext';

export const MonthlyHeader: React.FC = () => {
  const { getMonthlyTotal } = useExpenses();
  const total = getMonthlyTotal();

  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSequence(
      withSpring(1.05),
      withSpring(1)
    );
  }, [total]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const currentMonth = new Date().toLocaleDateString('es-EC', {
    month: 'long',
    year: 'numeric',
  });

  const formattedTotal = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(total);

  return (
    <View style={styles.container}>
      <GlassCard style={styles.card}>
        <LinearGradient
          colors={['rgba(255, 107, 157, 0.76)', 'rgba(196, 69, 105, 0.82)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardBackground}
        >
          <Text style={styles.monthText}>{currentMonth}</Text>
          <Animated.View style={animatedStyle}>
            <Text style={styles.totalLabel}>Total gastado del mes</Text>
            <Text style={styles.totalAmount}>{formattedTotal}</Text>
          </Animated.View>
        </LinearGradient>
      </GlassCard>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.four,
  },
  card: {
    overflow: 'hidden',
  },
  cardBackground: {
    padding: Spacing.four,
    borderRadius: Spacing.three,
    alignItems: 'center',
  },
  monthText: {
    fontSize: 16,
    fontWeight: '500',
    color: LiquidGlassColors.glassTextLight,
    textTransform: 'capitalize',
    marginBottom: Spacing.two,
  },
  totalLabel: {
    fontSize: 14,
    color: 'rgba(255, 251, 245, 0.82)',
    marginBottom: Spacing.one,
    textAlign: 'center',
  },
  totalAmount: {
    fontSize: 42,
    fontWeight: 'bold',
    color: LiquidGlassColors.glassTextLight,
    textAlign: 'center',
    letterSpacing: -1,
  },
});