import AppButton from '@/components/AppButton';
import AppCard from '@/components/AppCard';
import AppInput from '@/components/AppInput';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { useAppState } from '@/context/AppContext';
import { PaymentMethod } from '@/types/app';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const methods: PaymentMethod[] = ['UPI', 'CARD', 'NETBANKING', 'WALLET'];

export default function PaymentScreen() {
  const router = useRouter();
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const { bookings, confirmPayment } = useAppState();
  const booking = useMemo(() => bookings.find((item) => item.id === bookingId), [bookings, bookingId]);

  const [method, setMethod] = useState<PaymentMethod>('UPI');
  const [advance, setAdvance] = useState(booking ? String(Math.round(booking.estimatedPrice * 0.3)) : '0');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  if (!booking) {
    return (
      <View style={styles.center}>
        <Text>Booking not found.</Text>
      </View>
    );
  }

  function onPay() {
    if (!booking) {
      return;
    }
    setError('');
    setResult('');
    const response = confirmPayment(booking.id, method, Number(advance));
    if (!response.ok) {
      setError(response.error ?? 'Payment failed');
      return;
    }
    setResult(`Payment successful. Receipt: ${response.receiptId}`);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Payments</Text>
      <AppCard>
        <Text style={styles.meta}>Booking ID: {booking.bookingId}</Text>
        <Text style={styles.meta}>Ritual: {booking.ritualName}</Text>
        <Text style={styles.meta}>Total Estimate: INR {booking.estimatedPrice}</Text>
        <Text style={styles.meta}>
          Remaining after advance: INR {Math.max(booking.estimatedPrice - Number(advance || 0), 0)}
        </Text>
      </AppCard>

      <AppCard>
        <Text style={styles.selectLabel}>Select Payment Method</Text>
        <View style={styles.methods}>
          {methods.map((item) => (
            <Pressable key={item} onPress={() => setMethod(item)} style={[styles.chip, method === item ? styles.chipActive : undefined]}>
              <Text style={[styles.chipText, method === item ? styles.chipTextActive : undefined]}>{item}</Text>
            </Pressable>
          ))}
        </View>
        <AppInput label="Advance Amount" keyboardType="numeric" value={advance} onChangeText={setAdvance} />
        <AppButton title="Pay Advance & Confirm" onPress={onPay} />
      </AppCard>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {result ? <Text style={styles.result}>{result}</Text> : null}

      <AppButton title="Go to My Bookings" variant="ghost" onPress={() => router.replace('/(User)/bookings')} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.secondary,
    padding: Spacing.md,
    paddingTop: Spacing.xl,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.primaryDark,
    marginBottom: Spacing.md,
  },
  selectLabel: {
    color: Colors.textDark,
    fontWeight: '700',
    marginBottom: 8,
  },
  methods: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    marginRight: 8,
    marginBottom: 8,
  },
  chipActive: {
    backgroundColor: Colors.primarySoft,
    borderColor: Colors.primary,
  },
  chipText: {
    color: Colors.textLight,
    fontWeight: '700',
    fontSize: 12,
  },
  chipTextActive: {
    color: Colors.primaryDark,
  },
  meta: {
    color: Colors.textLight,
    marginBottom: 2,
  },
  error: {
    marginTop: 8,
    color: Colors.danger,
    fontWeight: '700',
  },
  result: {
    marginTop: 8,
    color: Colors.success,
    fontWeight: '700',
  },
});
