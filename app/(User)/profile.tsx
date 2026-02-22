import AppButton from '@/components/AppButton';
import AppCard from '@/components/AppCard';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { useAppState } from '@/context/AppContext';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Switch, Text } from 'react-native';

export default function DevoteeProfileScreen() {
  const router = useRouter();
  const { devoteeProfile, signOut, festivalRemindersEnabled, toggleFestivalReminders } = useAppState();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <AppCard>
        <Text style={styles.name}>{devoteeProfile?.name ?? 'Devotee User'}</Text>
        <Text style={styles.meta}>Gotra: {devoteeProfile?.gotra ?? 'Not set'}</Text>
      </AppCard>

      <AppCard compact>
        <Text style={styles.section}>Push Notifications</Text>
        <Text style={styles.meta}>Booking reminders and festival alerts.</Text>
        <Switch
          value={festivalRemindersEnabled}
          onValueChange={toggleFestivalReminders}
          trackColor={{ false: Colors.border, true: Colors.primarySoft }}
          thumbColor={festivalRemindersEnabled ? Colors.primaryDark : Colors.textLight}
        />
      </AppCard>

      <AppButton
        title="Sign Out"
        onPress={() => {
          signOut();
          router.replace('/');
        }}
        variant="ghost"
      />
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
  name: {
    fontSize: 19,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 8,
  },
  meta: {
    color: Colors.textLight,
    marginBottom: 2,
  },
  section: {
    color: Colors.textDark,
    fontWeight: '800',
    marginBottom: 4,
  },
});
