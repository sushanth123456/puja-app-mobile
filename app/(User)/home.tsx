import { PUJAS, Puja } from '@/data/pujas';
import { useRouter } from 'expo-router';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import AppButton from '../../components/AppButton';
import AppCard from '../../components/AppCard';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';

export default function Home() {

    const router=useRouter();
    const renderItem=({item}:{item:Puja}) =>(
        <AppCard>
      <Text style={styles.pujaTitle}>{item.name}</Text>
      <Text style={styles.desc}>{item.description}</Text>
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
    );
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a Puja</Text>
    
      <FlatList
        data={PUJAS}
        keyExtractor={(item)=>item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
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
    marginBottom: Spacing.md,
    color: Colors.textDark,
  },
  pujaTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    color: Colors.textDark,
  },
  desc: {
    color: Colors.textLight,
    marginBottom: Spacing.sm,
  },
});
