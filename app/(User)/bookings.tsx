import AppCard from '@/components/AppCard';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { useAppState } from '@/context/AppContext';
import { FlatList, StyleSheet, Text, View } from 'react-native';

export default function MyBookingsScreen() {
  const { bookings } = useAppState();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Bookings</Text>
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AppCard>
            <Text style={styles.ritual}>{item.ritualName}</Text>
            <Text style={styles.meta}>Booking ID: {item.bookingId}</Text>
            <Text style={styles.meta}>Pujari: {item.pujariName}</Text>
            <Text style={styles.meta}>Date: {item.date}</Text>
            <Text style={styles.meta}>Time: {item.timeSlot}</Text>
            <Text style={styles.meta}>Mode: {item.mode === 'AT_HOME' ? 'At Home' : 'Online'}</Text>
            <Text style={styles.meta}>Advance Paid: INR {item.advancePaid}</Text>
            <Text style={[styles.status, statusStyles[item.status]]}>{item.status}</Text>
            {item.receiptId ? <Text style={styles.receipt}>Receipt: {item.receiptId}</Text> : null}
          </AppCard>
        )}
      />
    </View>
  );
}

const statusStyles = StyleSheet.create({
  PENDING: { color: '#9E6B0D' },
  ACCEPTED: { color: '#1A6A2F' },
  REJECTED: { color: '#B92626' },
  CONFIRMED: { color: '#214B86' },
  COMPLETED: { color: '#455A64' },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.secondary,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xl,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.primaryDark,
    marginBottom: Spacing.md,
  },
  ritual: {
    fontWeight: '800',
    color: Colors.textDark,
    fontSize: 17,
    marginBottom: 4,
  },
  meta: {
    color: Colors.textLight,
    fontSize: 13,
    marginBottom: 2,
  },
  status: {
    marginTop: 8,
    fontWeight: '800',
  },
  receipt: {
    marginTop: 4,
    fontSize: 12,
    color: Colors.info,
  },
});
