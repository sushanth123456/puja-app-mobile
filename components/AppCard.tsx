import { StyleSheet, View } from 'react-native';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';

type Props = {
  children: React.ReactNode;
};

export default function AppCard({ children }: Props) {
  return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
});
