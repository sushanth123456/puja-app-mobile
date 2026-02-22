import AppCard from '@/components/AppCard';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { useAppState } from '@/context/AppContext';
import { ScrollView, StyleSheet, Text } from 'react-native';

export default function EarningsScreen() {
  const { bookings } = useAppState();
  const total = bookings.reduce((sum, item) => sum + item.advancePaid, 0);
  const weekly = Math.round(total * 0.32);
  const monthly = Math.round(total * 0.85);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Earnings Panel</Text>
      <AppCard>
        <Text style={styles.metric}>Total Earnings: INR {total}</Text>
        <Text style={styles.metric}>Weekly Report: INR {weekly}</Text>
        <Text style={styles.metric}>Monthly Report: INR {monthly}</Text>
      </AppCard>
      <AppCard>
        <Text style={styles.metric}>Payout Status: In Progress</Text>
        <Text style={styles.meta}>Next settlement cycle: 2026-02-25</Text>
        <Text style={styles.meta}>Payment history includes UPI and bank transfers.</Text>
      </AppCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.secondary,
    padding: Spacing.md,
    paddingTop: Spacing.xl,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.primaryDark,
    marginBottom: Spacing.md,
  },
  metric: {
    color: Colors.textDark,
    fontWeight: '700',
    marginBottom: 4,
  },
  meta: {
    color: Colors.textLight,
  },
});
