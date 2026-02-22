import AppButton from '@/components/AppButton';
import AppCard from '@/components/AppCard';
import AppInput from '@/components/AppInput';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { useAppState } from '@/context/AppContext';
import { apiSaveDevoteeProfile, apiSavePujariProfile } from '@/services/api';
import { Sampradaya } from '@/types/app';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const sampradayas: Sampradaya[] = ['Madhwa', 'Smarta'];
const languageOptions = ['Kannada', 'Telugu', 'English', 'Malayalam'];
const locationOptions = ['Hyderabad', 'Bangalore', 'Bengaluru', 'Chennai', 'Mysuru', 'Pune', 'Mumbai'];

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { session, authToken, saveDevoteeProfile, savePujariProfile } = useAppState();
  const role = session?.role ?? 'DEVOTEE';
  const [error, setError] = useState('');
  const [showLanguages, setShowLanguages] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);

  const [devotee, setDevotee] = useState({
    name: '',
    gotra: '',
  });

  const [pujari, setPujari] = useState({
    name: '',
    photoUrl: '',
    phone: '',
    email: '',
    location: '',
    experienceYears: '',
    languages: '',
    sampradaya: 'Smarta' as Sampradaya,
    specialties: '',
  });

  const title = useMemo(() => (role === 'DEVOTEE' ? 'Devotee Profile Setup' : 'Pujari Profile Setup'), [role]);

  const selectedLanguages = useMemo(
    () =>
      pujari.languages
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    [pujari.languages]
  );

  const locationSuggestions = useMemo(() => {
    if (!pujari.location.trim()) {
      return locationOptions;
    }
    return locationOptions.filter((item) =>
      item.toLowerCase().includes(pujari.location.trim().toLowerCase())
    );
  }, [pujari.location]);

  function toggleLanguage(language: string) {
    const next = selectedLanguages.includes(language)
      ? selectedLanguages.filter((item) => item !== language)
      : [...selectedLanguages, language];
    setPujari((prev) => ({ ...prev, languages: next.join(', ') }));
  }

  async function pickFromGallery() {
    setError('');
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('Gallery permission is required to upload profile photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      aspect: [1, 1],
    });
    if (!result.canceled && result.assets.length > 0) {
      setPujari((prev) => ({ ...prev, photoUrl: result.assets[0].uri }));
    }
  }

  async function captureFromCamera() {
    setError('');
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setError('Camera permission is required to capture profile photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
      aspect: [1, 1],
    });
    if (!result.canceled && result.assets.length > 0) {
      setPujari((prev) => ({ ...prev, photoUrl: result.assets[0].uri }));
    }
  }

  async function submit() {
    setError('');
    if (!authToken) {
      setError('Session expired. Please sign in again.');
      return;
    }
    if (role === 'DEVOTEE') {
      const remote = await apiSaveDevoteeProfile(devotee, authToken);
      if (!remote.ok) {
        setError(remote.error ?? 'Failed to save devotee profile to server.');
        return;
      }
      const result = saveDevoteeProfile(devotee);
      if (!result.ok) {
        setError(result.error ?? `Missing fields: ${result.missingFields?.join(', ')}`);
        return;
      }
      router.replace('/(User)/home');
      return;
    }
    const remote = await apiSavePujariProfile(pujari, authToken);
    if (!remote.ok) {
      setError(remote.error ?? 'Failed to save pujari profile to server.');
      return;
    }
    const result = savePujariProfile(pujari);
    if (!result.ok) {
      setError(result.error ?? `Missing fields: ${result.missingFields?.join(', ')}`);
      return;
    }
    router.replace('/(Pujari)/dashboard');
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>{title}</Text>
      <Text style={styles.subheading}>Complete profile once for trusted and faster bookings.</Text>

      {role === 'DEVOTEE' ? (
        <AppCard>
          <AppInput label="Name" value={devotee.name} onChangeText={(v) => setDevotee((p) => ({ ...p, name: v }))} />
          <AppInput label="Gotra" value={devotee.gotra} onChangeText={(v) => setDevotee((p) => ({ ...p, gotra: v }))} />
        </AppCard>
      ) : (
        <AppCard>
          <Text style={styles.selectLabel}>Profile Photo</Text>
          <View style={styles.photoRow}>
            <Image
              source={
                pujari.photoUrl
                  ? { uri: pujari.photoUrl }
                  : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=240&h=240&fit=crop'
              }
              style={styles.photo}
              contentFit="cover"
            />
            <View style={styles.photoActions}>
              <AppButton title="Upload from Gallery" variant="ghost" onPress={pickFromGallery} />
              <View style={styles.photoGap} />
              <AppButton title="Use Camera" variant="ghost" onPress={captureFromCamera} />
            </View>
          </View>

          <AppInput label="Name" value={pujari.name} onChangeText={(v) => setPujari((p) => ({ ...p, name: v }))} />
          <AppInput
            label="Phone"
            keyboardType="phone-pad"
            value={pujari.phone}
            onChangeText={(v) => setPujari((p) => ({ ...p, phone: v }))}
          />
          <AppInput
            label="Email"
            keyboardType="email-address"
            value={pujari.email}
            onChangeText={(v) => setPujari((p) => ({ ...p, email: v }))}
          />
          <AppInput
            label="Location"
            value={pujari.location}
            onFocus={() => setShowLocationSuggestions(true)}
            onChangeText={(v) => {
              setShowLocationSuggestions(true);
              setPujari((p) => ({ ...p, location: v }));
            }}
          />
          {showLocationSuggestions ? (
            <View style={styles.dropdown}>
              {locationSuggestions.map((item) => (
                <Pressable
                  key={item}
                  onPress={() => {
                    setPujari((p) => ({ ...p, location: item }));
                    setShowLocationSuggestions(false);
                  }}
                  style={styles.dropdownItem}>
                  <Text style={styles.dropdownText}>{item}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}

          <AppInput
            label="Experience (years)"
            keyboardType="numeric"
            value={pujari.experienceYears}
            onChangeText={(v) => setPujari((p) => ({ ...p, experienceYears: v.replace(/[^0-9]/g, '') }))}
          />

          <Text style={styles.selectLabel}>Languages</Text>
          <Pressable style={styles.dropdownTrigger} onPress={() => setShowLanguages((prev) => !prev)}>
            <Text style={styles.dropdownText}>
              {selectedLanguages.length > 0 ? selectedLanguages.join(', ') : 'Select known languages'}
            </Text>
          </Pressable>
          {showLanguages ? (
            <View style={styles.dropdown}>
              {languageOptions.map((item) => {
                const selected = selectedLanguages.includes(item);
                return (
                  <Pressable key={item} onPress={() => toggleLanguage(item)} style={styles.dropdownItem}>
                    <Text style={[styles.dropdownText, selected ? styles.dropdownSelectedText : undefined]}>
                      {selected ? '✓ ' : ''}
                      {item}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}

          <AppInput
            label="Ritual Specialties"
            value={pujari.specialties}
            onChangeText={(v) => setPujari((p) => ({ ...p, specialties: v }))}
          />
          <Text style={styles.selectLabel}>Sampradaya</Text>
          <View style={styles.chips}>
            {sampradayas.map((item) => (
              <Pressable
                key={item}
                onPress={() => setPujari((p) => ({ ...p, sampradaya: item }))}
                style={[styles.chip, pujari.sampradaya === item ? styles.chipActive : undefined]}>
                <Text style={[styles.chipText, pujari.sampradaya === item ? styles.chipTextActive : undefined]}>
                  {item === 'Smarta' ? 'Smartha' : item}
                </Text>
              </Pressable>
            ))}
          </View>
        </AppCard>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <AppButton title="Save Profile & Continue" onPress={() => void submit()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
    backgroundColor: Colors.secondary,
    paddingBottom: Spacing.xl,
  },
  heading: {
    marginTop: Spacing.md,
    fontSize: 26,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  subheading: {
    marginBottom: Spacing.md,
    color: Colors.textLight,
  },
  photoRow: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  photo: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Colors.primarySoft,
  },
  photoActions: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  photoGap: {
    height: Spacing.xs,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.sm,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 999,
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
    fontWeight: '600',
  },
  chipTextActive: {
    color: Colors.primaryDark,
  },
  selectLabel: {
    marginBottom: 8,
    color: Colors.textDark,
    fontWeight: '700',
  },
  dropdownTrigger: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    marginBottom: Spacing.xs,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    backgroundColor: Colors.white,
    marginBottom: Spacing.md,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dropdownText: {
    color: Colors.textDark,
  },
  dropdownSelectedText: {
    color: Colors.primaryDark,
    fontWeight: '700',
  },
  error: {
    color: Colors.danger,
    marginBottom: 8,
    fontWeight: '600',
  },
});
