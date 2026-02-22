import AppCard from '@/components/AppCard';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { ScrollView, StyleSheet, Text } from 'react-native';

export default function SupportScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Support</Text>
      <AppCard>
        <Text style={styles.heading}>Help Center</Text>
        <Text style={styles.body}>Email: support@pujaconnect.app</Text>
        <Text style={styles.body}>Phone: +91 80000 12345</Text>
        <Text style={styles.body}>Avg response: under 20 minutes</Text>
      </AppCard>
      <AppCard>
        <Text style={styles.heading}>Safety and Moderation</Text>
        <Text style={styles.body}>All bookings are screened with moderation and fraud-risk signals.</Text>
        <Text style={styles.body}>Report suspicious requests from booking details.</Text>
      </AppCard>
      <AppCard>
        <Text style={styles.heading}>Multi-language Ready</Text>
        <Text style={styles.body}>Localization-ready strings and language-aware pujari search are enabled.</Text>
      </AppCard>
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
  heading: {
    color: Colors.textDark,
    fontWeight: '800',
    fontSize: 16,
    marginBottom: 6,
  },
  body: {
    color: Colors.textLight,
    marginBottom: 2,
  },
});
