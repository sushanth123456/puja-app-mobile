import { StyleSheet, View } from 'react-native';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { Radius, Shadows } from '../constants/ui';

type Props = {
  children: React.ReactNode;
  compact?: boolean;
};

export default function AppCard({ children, compact = false }: Props) {
  return <View style={[styles.card, compact ? styles.compact : undefined]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.soft,
  },
  compact: {
    padding: Spacing.sm,
  },
});
