import AppCard from '@/components/AppCard';
import AppLogo from '@/components/AppLogo';
import { useAppState } from '@/context/AppContext';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { Radius } from '@/constants/ui';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function Index() {
  const router = useRouter();
  const { session, setSelectedRole } = useAppState();

  if (session?.role === 'DEVOTEE') {
    return <Redirect href="/(User)/home" />;
  }
  if (session?.role === 'PUJARI') {
    return <Redirect href="/(Pujari)/dashboard" />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AppLogo size="md" tagline="Your Divine Link" />
      </View>

      <AppCard>
        <Pressable
          accessibilityRole="button"
          style={styles.roleCard}
          onPress={() => {
            setSelectedRole('DEVOTEE');
            router.push('/auth' as never);
          }}>
          <View style={[styles.iconWrap, { backgroundColor: '#FFE8D8' }]}>
            <Ionicons name="heart-circle" size={28} color={Colors.primaryDark} />
          </View>
          <View style={styles.textWrap}>
            <Text style={styles.cardTitle}>I am a Devotee</Text>
            <Text style={styles.cardDescription}>Book rituals, choose trusted pujaris, and track pujas.</Text>
          </View>
        </Pressable>
      </AppCard>

      <AppCard>
        <Pressable
          accessibilityRole="button"
          style={styles.roleCard}
          onPress={() => {
            setSelectedRole('PUJARI');
            router.push('/auth' as never);
          }}>
          <View style={[styles.iconWrap, { backgroundColor: '#FFF1E5' }]}>
            <Ionicons name="people-circle" size={28} color={Colors.primaryDark} />
          </View>
          <View style={styles.textWrap}>
            <Text style={styles.cardTitle}>I am a Pujari</Text>
            <Text style={styles.cardDescription}>
              Manage bookings, availability, and earnings professionally.
            </Text>
          </View>
        </Pressable>
      </AppCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.secondary,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xxl,
  },
  header: {
    marginBottom: Spacing.xl,
    marginTop: Spacing.sm,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  cardTitle: {
    fontWeight: '800',
    color: Colors.textDark,
    fontSize: 18,
  },
  cardDescription: {
    marginTop: 4,
    color: Colors.textLight,
    fontSize: 14,
    lineHeight: 20,
  },
});
