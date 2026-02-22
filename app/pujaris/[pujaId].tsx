import AppButton from '@/components/AppButton';
import AppCard from '@/components/AppCard';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { useAppState } from '@/context/AppContext';
import { PUJARIS } from '@/data/pujaris';
import { RITUALS } from '@/data/pujas';
import { apiListPujaris } from '@/services/api';
import { PujariProfile, Sampradaya } from '@/types/app';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

const sampradayaFilters: (Sampradaya | 'All')[] = ['All', 'Madhwa', 'Smarta'];

function displaySampradaya(value: Sampradaya | 'All'): string {
  return value === 'Smarta' ? 'Smartha' : value;
}

export default function PujariListScreen() {
  const router = useRouter();
  const { pujaId } = useLocalSearchParams<{ pujaId: string }>();
  const { savedPujaris, toggleSavedPujari } = useAppState();
  const [selectedSampradaya, setSelectedSampradaya] = useState<Sampradaya | 'All'>('All');
  const [pujaris, setPujaris] = useState<PujariProfile[]>(PUJARIS);

  const ritual = RITUALS.find((item) => item.id === pujaId);

  useEffect(() => {
    let mounted = true;
    async function loadPujaris() {
      const response = await apiListPujaris();
      if (mounted && response.ok && response.data) {
        setPujaris(response.data);
      }
    }
    void loadPujaris();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    return pujaris.filter((pujari) => {
      const sampradayaPass =
        selectedSampradaya === 'All' || pujari.sampradaya === selectedSampradaya;
      return sampradayaPass;
    });
  }, [pujaris, selectedSampradaya]);

  const renderItem = ({ item }: { item: PujariProfile }) => {
    const saved = savedPujaris.includes(item.id);
    return (
      <AppCard>
        <View style={styles.headerRow}>
          <Image
            source={item.photoUrl ?? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop'}
            style={styles.avatar}
            contentFit="cover"
          />
          <View style={styles.headerText}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.meta}>
              {item.yearsExperience} years experience | {displaySampradaya(item.sampradaya)}
            </Text>
            <Text style={styles.meta}>Languages: {item.languages.join(', ')}</Text>
            <Text style={[styles.verify, item.verified ? styles.verifyTrue : styles.verifyFalse]}>
              {item.verified ? 'Verified Pujari' : 'Verification Pending'}
            </Text>
          </View>
        </View>
        <Text style={styles.meta}>{item.bio}</Text>
        <Text style={styles.meta}>Location: {item.location}</Text>
        <Text style={styles.meta}>Specialties: {item.ritualSpecialties.join(', ')}</Text>
        <Text style={styles.meta}>Rating: {item.rating} ({item.reviewCount} reviews)</Text>
        <Text style={styles.meta}>Price: INR {item.pricePerHour}/hour</Text>
        <Text style={styles.meta}>Next availability: {item.availability[0]}</Text>
        <View style={styles.row}>
          <View style={styles.half}>
            <AppButton title={saved ? 'Saved' : 'Save'} onPress={() => toggleSavedPujari(item.id)} variant="ghost" />
          </View>
          <View style={styles.half}>
            <AppButton
              title="Book"
              onPress={() =>
                router.push({
                  pathname: '/booking/create' as never,
                  params: {
                    pujaId,
                    pujariId: item.id,
                  },
                })
              }
            />
          </View>
        </View>
      </AppCard>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pujari Listings</Text>
      <Text style={styles.subtitle}>Ritual: {ritual?.name ?? 'Custom Request'}</Text>

      <Text style={styles.filterHeading}>Sampradaya</Text>
      <View style={styles.filters}>
        {sampradayaFilters.map((item) => (
          <Pressable
            key={item}
            onPress={() => setSelectedSampradaya(item)}
            style={[styles.chip, selectedSampradaya === item ? styles.chipActive : undefined]}>
            <Text style={[styles.chipText, selectedSampradaya === item ? styles.chipTextActive : undefined]}>
              {displaySampradaya(item)}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.empty}>No pujaris found for this filter.</Text>}
      />
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
    fontSize: 25,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  subtitle: {
    color: Colors.textLight,
    marginBottom: Spacing.md,
  },
  filterHeading: {
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 6,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 99,
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
    fontWeight: '600',
    fontSize: 12,
  },
  chipTextActive: {
    color: Colors.primaryDark,
  },
  name: {
    fontWeight: '800',
    color: Colors.textDark,
    fontSize: 18,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  headerText: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primarySoft,
  },
  meta: {
    color: Colors.textLight,
    marginTop: 2,
    fontSize: 12,
  },
  verify: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '700',
  },
  verifyTrue: {
    color: Colors.success,
  },
  verifyFalse: {
    color: Colors.warning,
  },
  row: {
    flexDirection: 'row',
    marginTop: Spacing.sm,
    gap: 8,
  },
  half: {
    flex: 1,
  },
  listContent: {
    paddingBottom: Spacing.lg,
  },
  empty: {
    textAlign: 'center',
    color: Colors.textLight,
    marginTop: Spacing.md,
    fontWeight: '600',
  },
});
