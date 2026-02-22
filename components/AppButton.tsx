import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/colors';
import { Radius } from '../constants/ui';

type Props = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost';
};

export default function AppButton({ title, onPress, variant = 'primary' }: Props) {
  return (
    <TouchableOpacity
      style={[styles.button, variant === 'ghost' ? styles.ghostButton : undefined]}
      onPress={onPress}>
      <Text style={[styles.text, variant === 'ghost' ? styles.ghostText : undefined]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: Radius.md,
    alignItems: 'center',
    minHeight: 48,
  },
  text: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
  ghostButton: {
    backgroundColor: Colors.primarySoft,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  ghostText: {
    color: Colors.primaryDark,
  },
});
