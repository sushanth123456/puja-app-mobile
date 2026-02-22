import AppButton from '@/components/AppButton';
import AppCard from '@/components/AppCard';
import AppInput from '@/components/AppInput';
import AppLogo from '@/components/AppLogo';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { useAppState } from '@/context/AppContext';
import { apiSendOtp, apiSignIn } from '@/services/api';
import { AuthMethod, Role } from '@/types/app';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

const methods: { method: AuthMethod; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { method: 'GOOGLE', label: 'Continue with Google', icon: 'logo-google' },
  { method: 'APPLE', label: 'Continue with Apple', icon: 'logo-apple' },
  { method: 'PHONE_OTP', label: 'Phone OTP Login', icon: 'call' },
  { method: 'EMAIL', label: 'Email Login', icon: 'mail' },
];

export default function AuthScreen() {
  const router = useRouter();
  const { selectedRole, signIn, setAuthToken } = useAppState();
  const role: Role = selectedRole ?? 'DEVOTEE';

  const [activeMethod, setActiveMethod] = useState<AuthMethod>('PHONE_OTP');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const title = useMemo(
    () => (role === 'DEVOTEE' ? 'Devotee Authentication' : 'Pujari Authentication'),
    [role]
  );

  function goToNext() {
    router.replace('/profile-setup' as never);
  }

  function normalizePhone(value: string) {
    const digits = value.replace(/\D/g, '');
    return digits.length > 10 ? digits.slice(-10) : digits;
  }

  function normalizeOtp(value: string) {
    return value.replace(/\D/g, '');
  }

  async function sendOtp() {
    const normalizedPhone = normalizePhone(phone);
    setError('');
    setInfo('');
    if (normalizedPhone.length !== 10) {
      setOtpSent(false);
      setError('Enter a valid 10-digit phone number.');
      return;
    }
    setSubmitting(true);
    const response = await apiSendOtp(normalizedPhone);
    setSubmitting(false);
    if (!response.ok) {
      setOtpSent(false);
      setError(response.error ?? 'Unable to send OTP right now.');
      return;
    }
    setOtpSent(true);
    setOtp('');
    setInfo(`OTP sent to ${normalizedPhone}.`);
  }

  async function submit(method: AuthMethod) {
    setError('');
    setInfo('');
    if (method === 'GOOGLE' || method === 'APPLE') {
      setError('Google/Apple login requires backend OAuth setup and native client configuration.');
      return;
    }

    if (method === 'PHONE_OTP') {
      const normalizedPhone = normalizePhone(phone);
      const normalizedOtp = normalizeOtp(otp);
      if (!otpSent) {
        setError('Send OTP first.');
        return;
      }
      setSubmitting(true);
      const authResponse = await apiSignIn({
        role,
        method,
        phone: normalizedPhone,
        otp: normalizedOtp,
      });
      setSubmitting(false);
      if (!authResponse.ok) {
        setError(authResponse.error ?? 'Invalid OTP or verification failed.');
        return;
      }
      setAuthToken(authResponse.data?.token ?? null);
      const result = signIn({ role, method, phone: normalizedPhone, otp: normalizedOtp });
      if (!result.ok) {
        setError(result.error ?? 'Authentication failed.');
        return;
      }
      goToNext();
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    setSubmitting(true);
    const authResponse = await apiSignIn({
      role,
      method,
      email: normalizedEmail,
      password: password.trim(),
    });
    setSubmitting(false);
    if (!authResponse.ok) {
      setError(authResponse.error ?? 'Authentication failed.');
      return;
    }
    setAuthToken(authResponse.data?.token ?? null);
    const result = signIn({
      role,
      method,
      email: normalizedEmail,
      password: password.trim(),
    });
    if (!result.ok) {
      setError(result.error ?? 'Unable to start local session.');
      return;
    }
    goToNext();
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <AppLogo size="sm" tagline="Your Divine Link" />
      <Text style={styles.heading}>Secure Sign-In</Text>
      <Text style={styles.subheading}>{title}</Text>

      <AppCard>
        {methods.map((item) => (
          <Pressable
            key={item.method}
            onPress={() => {
              setActiveMethod(item.method);
              setError('');
              setInfo('');
              if (item.method === 'GOOGLE' || item.method === 'APPLE') {
                void submit(item.method);
              }
            }}
            style={[styles.methodRow, activeMethod === item.method ? styles.methodRowActive : undefined]}>
            <Ionicons
              name={item.icon}
              size={20}
              color={activeMethod === item.method ? Colors.primaryDark : Colors.textLight}
            />
            <Text
              style={[styles.methodLabel, activeMethod === item.method ? styles.methodLabelActive : undefined]}>
              {item.label}
            </Text>
          </Pressable>
        ))}
      </AppCard>

      {activeMethod === 'PHONE_OTP' ? (
        <AppCard>
          <AppInput
            label="Phone Number"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={(value) => {
              setPhone(value);
              if (otpSent) {
                setOtpSent(false);
              }
            }}
            placeholder="+91 98765 43210"
          />
          <AppButton
            title={submitting ? 'Please wait...' : otpSent ? 'Resend OTP' : 'Send OTP'}
            onPress={() => void sendOtp()}
            variant="ghost"
          />
          <AppInput
            label="OTP"
            keyboardType="number-pad"
            value={otp}
            onChangeText={(value) => setOtp(normalizeOtp(value))}
            placeholder="Enter OTP"
          />
          <AppButton title="Verify OTP & Continue" onPress={() => void submit('PHONE_OTP')} />
        </AppCard>
      ) : null}

      {activeMethod === 'EMAIL' ? (
        <AppCard>
          <AppInput
            label="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
          />
          <AppInput
            label="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholder="Minimum 6 characters"
          />
          <AppButton title="Continue with Email" onPress={() => void submit('EMAIL')} />
        </AppCard>
      ) : null}

      {info ? <Text style={styles.info}>{info}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
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
    marginTop: Spacing.lg,
    fontSize: 28,
    fontWeight: '800',
    color: Colors.primaryDark,
    textAlign: 'center',
  },
  subheading: {
    marginBottom: Spacing.md,
    color: Colors.textLight,
    fontSize: 15,
    textAlign: 'center',
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: 12,
    marginBottom: 8,
  },
  methodRowActive: {
    backgroundColor: Colors.primarySoft,
  },
  methodLabel: {
    marginLeft: Spacing.sm,
    color: Colors.textLight,
    fontWeight: '600',
  },
  methodLabelActive: {
    color: Colors.primaryDark,
    fontWeight: '700',
  },
  error: {
    marginTop: Spacing.sm,
    color: Colors.danger,
    fontWeight: '600',
  },
  info: {
    marginTop: Spacing.sm,
    color: Colors.info,
    fontWeight: '600',
  },
});
