import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  size?: 'sm' | 'md' | 'lg';
  tagline?: string;
};

const SIZE_MAP = {
  sm: { orb: 62, emoji: 30, title: 32, subtitle: 14 },
  md: { orb: 84, emoji: 40, title: 40, subtitle: 16 },
  lg: { orb: 104, emoji: 48, title: 46, subtitle: 18 },
};

export default function AppLogo({ size = 'md', tagline = 'Sacred rituals at your doorstep' }: Props) {
  const token = SIZE_MAP[size];

  return (
    <View style={styles.root}>
      <View style={[styles.orb, { width: token.orb, height: token.orb, borderRadius: token.orb / 2 }]}>
        <Text style={[styles.emoji, { fontSize: token.emoji }]}>🙏</Text>
      </View>
      <Text style={[styles.title, { fontSize: token.title }]}>PujaConnect</Text>
      <Text style={[styles.subtitle, { fontSize: token.subtitle }]}>{tagline}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
  },
  orb: {
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primaryDark,
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
    elevation: 4,
  },
  emoji: {
    textAlign: 'center',
  },
  title: {
    marginTop: Spacing.md,
    fontWeight: '900',
    color: Colors.primaryDark,
    letterSpacing: 0.4,
  },
  subtitle: {
    marginTop: Spacing.xs,
    color: Colors.textLight,
    textAlign: 'center',
    fontWeight: '500',
  },
});
