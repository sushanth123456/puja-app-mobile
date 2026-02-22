import AppButton from '@/components/AppButton';
import AppCard from '@/components/AppCard';
import AppInput from '@/components/AppInput';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

function nextSevenDays(): string[] {
  const days: string[] = [];
  const now = new Date();
  for (let index = 0; index < 7; index += 1) {
    const date = new Date(now);
    date.setDate(now.getDate() + index);
    days.push(date.toISOString().slice(0, 10));
  }
  return days;
}

const slots = ['06:00 AM - 08:00 AM', '08:00 AM - 10:00 AM', '10:00 AM - 12:00 PM', '06:00 PM - 08:00 PM'];

export default function AvailabilityScreen() {
  const days = useMemo(() => nextSevenDays(), []);
  const [selectedDate, setSelectedDate] = useState(days[0]);
  const [blockedSlots, setBlockedSlots] = useState<string[]>([]);
  const [recurringRule, setRecurringRule] = useState('Weekdays 6:00 AM - 12:00 PM');
  const [festivalOverride, setFestivalOverride] = useState('Maha Shivaratri: Extended 5:00 AM - 10:00 PM');

  function toggleSlot(slot: string) {
    setBlockedSlots((prev) => (prev.includes(slot) ? prev.filter((item) => item !== slot) : [...prev, slot]));
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Availability Manager</Text>

      <AppCard>
        <Text style={styles.section}>Select Date</Text>
        <View style={styles.chips}>
          {days.map((day) => (
            <Pressable
              key={day}
              onPress={() => setSelectedDate(day)}
              style={[styles.chip, selectedDate === day ? styles.chipActive : undefined]}>
              <Text style={[styles.chipText, selectedDate === day ? styles.chipTextActive : undefined]}>{day}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.meta}>Selected Date: {selectedDate}</Text>
      </AppCard>

      <AppCard>
        <Text style={styles.section}>Block Time Slots</Text>
        <View style={styles.chips}>
          {slots.map((slot) => {
            const selected = blockedSlots.includes(slot);
            return (
              <Pressable
                key={slot}
                onPress={() => toggleSlot(slot)}
                style={[styles.chip, selected ? styles.chipActive : undefined]}>
                <Text style={[styles.chipText, selected ? styles.chipTextActive : undefined]}>
                  {selected ? 'Blocked: ' : ''}
                  {slot}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <AppInput
          label="Recurring Availability"
          value={recurringRule}
          onChangeText={setRecurringRule}
          placeholder="e.g. Mon-Fri 6 AM - 2 PM"
        />
        <AppInput
          label="Festival Overrides"
          value={festivalOverride}
          onChangeText={setFestivalOverride}
          placeholder="e.g. Diwali custom timings"
        />
        <AppButton title="Save Availability" onPress={() => {}} />
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
    color: Colors.primaryDark,
    fontWeight: '800',
    marginBottom: Spacing.md,
  },
  section: {
    color: Colors.textDark,
    fontWeight: '700',
    marginBottom: Spacing.xs,
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
  meta: {
    color: Colors.textLight,
    marginTop: 8,
  },
});
