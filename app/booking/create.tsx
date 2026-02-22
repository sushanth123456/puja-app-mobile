import AppButton from '@/components/AppButton';
import AppCard from '@/components/AppCard';
import AppInput from '@/components/AppInput';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { useAppState } from '@/context/AppContext';
import { PUJARIS } from '@/data/pujaris';
import { RITUALS } from '@/data/pujas';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const slots = ['06:30 AM - 08:00 AM', '08:00 AM - 10:00 AM', '10:00 AM - 12:00 PM', '06:00 PM - 08:00 PM'];

export default function CreateBookingScreen() {
  const router = useRouter();
  const { createBookingDraft, devoteeProfile } = useAppState();
  const params = useLocalSearchParams<{ pujaId: string; pujariId: string }>();

  const ritual = RITUALS.find((item) => item.id === params.pujaId);
  const pujari = PUJARIS.find((item) => item.id === params.pujariId);

  const [date, setDate] = useState('2026-02-27');
  const [slot, setSlot] = useState(slots[0]);
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [materials, setMaterials] = useState(ritual?.materials.join(', ') ?? '');
  const [mode, setMode] = useState<'ONLINE' | 'AT_HOME'>('AT_HOME');
  const [error, setError] = useState('');

  function onContinue() {
    if (!date || !slot || !location) {
      setError('Date, time slot, and location are required.');
      return;
    }
    const draft = createBookingDraft({
      pujariId: params.pujariId,
      ritualId: params.pujaId,
      date,
      timeSlot: slot,
      location,
      devoteeName: devoteeProfile?.name ?? 'Devotee',
      specialNotes: notes,
      materialsRequired: materials
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      mode,
    });
    router.push({
      pathname: '/booking/payment' as never,
      params: {
        bookingId: draft.id,
      },
    });
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Booking Flow</Text>
      <Text style={styles.subtitle}>Ritual: {ritual?.name}</Text>

      <AppCard>
        <Text style={styles.label}>Pujari</Text>
        <Text style={styles.value}>{pujari?.name ?? 'Assigned'}</Text>
        <Text style={styles.label}>Estimated Price</Text>
        <Text style={styles.value}>INR {Math.round(((ritual?.minPrice ?? 2000) + (ritual?.maxPrice ?? 6000)) / 2)}</Text>
      </AppCard>

      <AppCard>
        <AppInput label="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} />
        <Text style={styles.label}>Time Slot</Text>
        <View style={styles.chips}>
          {slots.map((item) => (
            <Pressable key={item} onPress={() => setSlot(item)} style={[styles.chip, slot === item ? styles.chipActive : undefined]}>
              <Text style={[styles.chipText, slot === item ? styles.chipTextActive : undefined]}>{item}</Text>
            </Pressable>
          ))}
        </View>
        <AppInput label="Location" value={location} onChangeText={setLocation} />
        <Text style={styles.label}>Mode</Text>
        <View style={styles.row}>
          <View style={styles.half}>
            <AppButton title="At Home" variant={mode === 'AT_HOME' ? 'primary' : 'ghost'} onPress={() => setMode('AT_HOME')} />
          </View>
          <View style={styles.half}>
            <AppButton title="Online" variant={mode === 'ONLINE' ? 'primary' : 'ghost'} onPress={() => setMode('ONLINE')} />
          </View>
        </View>
        <AppInput label="Materials Required" value={materials} onChangeText={setMaterials} />
        <AppInput label="Special Notes" value={notes} onChangeText={setNotes} multiline numberOfLines={3} />
      </AppCard>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <AppButton title="Confirm & Continue to Payment" onPress={onContinue} />
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
  },
  subtitle: {
    color: Colors.textLight,
    marginBottom: Spacing.md,
  },
  label: {
    color: Colors.textLight,
    fontSize: 12,
    marginTop: 2,
  },
  value: {
    color: Colors.textDark,
    fontWeight: '700',
    marginBottom: 8,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.sm,
  },
  chip: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: Colors.white,
  },
  chipActive: {
    backgroundColor: Colors.primarySoft,
    borderColor: Colors.primary,
  },
  chipText: {
    color: Colors.textLight,
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextActive: {
    color: Colors.primaryDark,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.md,
  },
  half: {
    flex: 1,
  },
  error: {
    color: Colors.danger,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
});
