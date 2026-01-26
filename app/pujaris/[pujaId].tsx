import { PUJARIS, Pujari } from '@/data/pujaris';
import { useLocalSearchParams } from 'expo-router';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import AppButton from '../../components/AppButton';
import AppCard from '../../components/AppCard';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';

export default function PujariList() {
  const { pujaId } = useLocalSearchParams<{pujaId: string}>();
  
  const filteredPujaris = PUJARIS.filter((p) =>
    p.pujaIds.includes(pujaId)
  );

  const renderItem = ({ item }: { item: Pujari }) => (
    <AppCard>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.info}>Experience: {item.experience} years</Text>
      <Text style={styles.info}>Languages: {item.languages.join(', ')}</Text>
      <AppButton title="Send Booking Request" onPress={() => {}} />
    </AppCard>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available Pujaris</Text>

      <FlatList
        data={filteredPujaris}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.secondary,
    padding: Spacing.md,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: Spacing.md,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    color: Colors.textDark,
  },
  info: {
    color: Colors.textLight,
    marginBottom: 2,
  },
});
