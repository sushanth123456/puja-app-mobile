import AppButton from '@/components/AppButton';
import AppCard from '@/components/AppCard';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { RITUALS } from '@/data/pujas';
import { useRouter } from 'expo-router';
import { FlatList, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Book a Puja</Text>
      <Text style={styles.subtitle}>Choose rituals, compare pujari profiles, and book confidently.</Text>
      <AppButton title="My Bookings" variant="ghost" onPress={() => router.push('/(User)/bookings')} />

      <FlatList
        style={styles.list}
        data={RITUALS}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <AppCard>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardDescription}>{item.description}</Text>
            <Text style={styles.meta}>Duration: {item.durationMinutes} min</Text>
            <Text style={styles.meta}>Price Range: INR {item.minPrice} - INR {item.maxPrice}</Text>
            <Text style={styles.materials}>Materials: {item.materials.join(', ')}</Text>
            <AppButton
              title="View Pujaris"
              onPress={() =>
                router.push({
                  pathname: '/pujaris/[pujaId]',
                  params: { pujaId: item.id },
                })
              }
            />
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
    paddingTop: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: Spacing.md,
  },
  list: {
    marginTop: Spacing.md,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 4,
  },
  cardDescription: {
    color: Colors.textLight,
    marginBottom: 8,
  },
  meta: {
    color: Colors.textDark,
    fontSize: 13,
    marginBottom: 2,
  },
  materials: {
    color: Colors.textLight,
    fontSize: 12,
    marginBottom: Spacing.sm,
  },
});
