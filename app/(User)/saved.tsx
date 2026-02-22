import AppCard from '@/components/AppCard';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { useAppState } from '@/context/AppContext';
import { PUJARIS } from '@/data/pujaris';
import { FlatList, StyleSheet, Text, View } from 'react-native';

export default function SavedPujarisScreen() {
  const { savedPujaris } = useAppState();
  const saved = PUJARIS.filter((p) => savedPujaris.includes(p.id));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Saved Pujaris</Text>
      {saved.length === 0 ? (
        <Text style={styles.empty}>No saved pujari profiles yet.</Text>
      ) : (
        <FlatList
          data={saved}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AppCard>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>
                {item.sampradaya} | {item.yearsExperience} years
              </Text>
              <Text style={styles.meta}>Languages: {item.languages.join(', ')}</Text>
              <Text style={styles.meta}>Rating: {item.rating} ({item.reviewCount})</Text>
            </AppCard>
          )}
        />
      )}
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
  empty: {
    color: Colors.textLight,
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textDark,
  },
  meta: {
    color: Colors.textLight,
    marginTop: 2,
  },
});
