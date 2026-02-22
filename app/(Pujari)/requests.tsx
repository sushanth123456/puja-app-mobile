import AppButton from '@/components/AppButton';
import AppCard from '@/components/AppCard';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { useAppState } from '@/context/AppContext';
import { FlatList, StyleSheet, Text, View } from 'react-native';

export default function BookingRequestsScreen() {
  const { bookings, acceptBooking, rejectBooking, markCompleted } = useAppState();
  const requests = bookings.filter((item) => item.status === 'PENDING' || item.status === 'ACCEPTED');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Booking Requests</Text>

      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AppCard>
            <Text style={styles.ritual}>{item.ritualName}</Text>
            <Text style={styles.meta}>Devotee: {item.devoteeName}</Text>
            <Text style={styles.meta}>Date: {item.date} | {item.timeSlot}</Text>
            <Text style={styles.meta}>Location: {item.location}</Text>
            <Text style={styles.meta}>Notes: {item.specialNotes || 'None'}</Text>
            <Text style={styles.meta}>Moderation flags: {item.moderationFlags.join(', ') || 'None'}</Text>
            <Text style={styles.meta}>Fraud risk score: {item.fraudRiskScore}/100</Text>
            <View style={styles.row}>
              <View style={styles.flex}>
                <AppButton title="Accept" onPress={() => acceptBooking(item.id)} />
              </View>
              <View style={styles.flex}>
                <AppButton title="Reject" variant="ghost" onPress={() => rejectBooking(item.id)} />
              </View>
            </View>
            {item.status === 'ACCEPTED' ? <AppButton title="Mark Completed" onPress={() => markCompleted(item.id)} /> : null}
          </AppCard>
        )}
      />
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
    marginBottom: Spacing.md,
  },
  ritual: {
    color: Colors.textDark,
    fontWeight: '800',
    fontSize: 17,
  },
  meta: {
    color: Colors.textLight,
    marginTop: 2,
    fontSize: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  flex: {
    flex: 1,
  },
});
