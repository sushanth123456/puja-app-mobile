import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { StyleSheet, Text, View } from 'react-native';

export default function OfflineBanner() {
  return (
    <View style={styles.banner}>
      <Text style={styles.text}>
        Offline mode: showing cached data. Payments and live availability may be delayed.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: Colors.primarySoft,
    borderWidth: 1,
    borderColor: Colors.accent,
    borderRadius: 12,
    marginBottom: Spacing.md,
    padding: Spacing.sm,
  },
  text: {
    color: Colors.warning,
    fontWeight: '600',
    fontSize: 12,
  },
});
