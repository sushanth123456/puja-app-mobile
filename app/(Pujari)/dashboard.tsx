import AppCard from '@/components/AppCard';
import AppButton from '@/components/AppButton';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { useAppState } from '@/context/AppContext';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function PujariDashboardScreen() {
  const router = useRouter();
  const { bookings } = useAppState();
  const today = '2026-02-22';
  const todaysBookings = bookings.filter((item) => item.date === today).length;
  const upcoming = bookings.filter((item) => item.date > today && item.status !== 'REJECTED').length;
  const pending = bookings.filter((item) => item.status === 'PENDING').length;
  const earnings = bookings.reduce((total, item) => total + item.advancePaid, 0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pujari Dashboard</Text>
      <Text style={styles.subtitle}>Today: {today}</Text>

      <AppCard>
        <Text style={styles.metric}>Today&apos;s Bookings: {todaysBookings}</Text>
        <Text style={styles.metric}>Upcoming Pujas: {upcoming}</Text>
      </AppCard>
      <AppCard>
        <Text style={styles.metric}>Pending Requests: {pending}</Text>
        <Text style={styles.metric}>Earnings Summary: INR {earnings}</Text>
      </AppCard>
      <AppCard>
        <Text style={styles.metric}>Calendar</Text>
        <Text style={styles.help}>Use Availability tab to block slots and set recurring/festival overrides.</Text>
        <View style={styles.actionGap} />
        <AppButton title="Open Availability Calendar" onPress={() => router.push('/(Pujari)/calendar')} />
      </AppCard>
      <AppCard compact>
        <AppButton title="Open Pending Requests" onPress={() => router.push('/(Pujari)/requests')} />
        <View style={styles.actionGap} />
        <AppButton title="Open Earnings" variant="ghost" onPress={() => router.push('/(Pujari)/earnings')} />
      </AppCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.secondary,
    padding: Spacing.md,
    paddingTop: Spacing.xl,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  subtitle: {
    color: Colors.textLight,
    marginBottom: Spacing.md,
  },
  metric: {
    color: Colors.textDark,
    fontWeight: '700',
    marginBottom: 4,
  },
  help: {
    color: Colors.textLight,
    fontSize: 12,
  },
  actionGap: {
    height: Spacing.sm,
  },
});
