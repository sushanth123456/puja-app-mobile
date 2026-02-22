import AppButton from '@/components/AppButton';
import AppCard from '@/components/AppCard';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { useAppState } from '@/context/AppContext';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text } from 'react-native';

export default function PujariProfileScreen() {
  const router = useRouter();
  const { pujariProfile, signOut } = useAppState();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Pujari Profile</Text>
      <AppCard>
        <Image
          source={
            pujariProfile?.photoUrl
              ? { uri: pujariProfile.photoUrl }
              : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=240&h=240&fit=crop'
          }
          style={styles.photo}
          contentFit="cover"
        />
        <Text style={styles.name}>{pujariProfile?.name ?? 'Pujari User'}</Text>
        <Text style={styles.meta}>Phone: {pujariProfile?.phone ?? 'Not set'}</Text>
        <Text style={styles.meta}>Email: {pujariProfile?.email ?? 'Not set'}</Text>
        <Text style={styles.meta}>Location: {pujariProfile?.location ?? 'Not set'}</Text>
        <Text style={styles.meta}>Experience: {pujariProfile?.experienceYears ?? 'Not set'} years</Text>
        <Text style={styles.meta}>Languages: {pujariProfile?.languages ?? 'Not set'}</Text>
        <Text style={styles.meta}>
          Sampradaya:{' '}
          {pujariProfile?.sampradaya ? (pujariProfile.sampradaya === 'Smarta' ? 'Smartha' : pujariProfile.sampradaya) : 'Not set'}
        </Text>
        <Text style={styles.meta}>Specialties: {pujariProfile?.specialties ?? 'Not set'}</Text>
      </AppCard>
      <AppButton
        title="Sign Out"
        variant="ghost"
        onPress={() => {
          signOut();
          router.replace('/');
        }}
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
    fontSize: 18,
    color: Colors.textDark,
    fontWeight: '800',
    marginBottom: 8,
  },
  meta: {
    color: Colors.textLight,
    marginBottom: 2,
  },
  photo: {
    width: 76,
    height: 76,
    borderRadius: 38,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.primarySoft,
  },
});
