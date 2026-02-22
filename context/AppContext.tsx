import { PUJARIS } from '@/data/pujaris';
import { RITUALS } from '@/data/pujas';
import { isEmail, isPhone, validateRequiredFields } from '@/lib/validation';
import { evaluateFraudRisk, moderationFlagsForText } from '@/services/fraud';
import { logError, logInfo } from '@/services/logger';
import {
  registerPushNotifications,
  scheduleBookingReminder,
  scheduleFestivalReminders,
} from '@/services/notifications';
import {
  AuthMethod,
  Booking,
  DevoteeProfile,
  PaymentMethod,
  PujariOnboardingProfile,
  Role,
  SessionUser,
} from '@/types/app';
import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

type AuthPayload = {
  role: Role;
  method: AuthMethod;
  email?: string;
  phone?: string;
  otp?: string;
  password?: string;
};

type BookingPayload = {
  pujariId: string;
  ritualId: string;
  date: string;
  timeSlot: string;
  location: string;
  devoteeName: string;
  specialNotes: string;
  materialsRequired: string[];
  mode: 'ONLINE' | 'AT_HOME';
};

type AppContextValue = {
  selectedRole: Role | null;
  session: SessionUser | null;
  authToken: string | null;
  devoteeProfile: DevoteeProfile | null;
  pujariProfile: PujariOnboardingProfile | null;
  bookings: Booking[];
  savedPujaris: string[];
  festivalRemindersEnabled: boolean;
  setSelectedRole: (role: Role) => void;
  setAuthToken: (token: string | null) => void;
  signIn: (payload: AuthPayload) => { ok: boolean; error?: string };
  signOut: () => void;
  saveDevoteeProfile: (
    profile: DevoteeProfile
  ) => { ok: boolean; missingFields?: string[]; error?: string };
  savePujariProfile: (
    profile: PujariOnboardingProfile
  ) => { ok: boolean; missingFields?: string[]; error?: string };
  createBookingDraft: (payload: BookingPayload) => Booking;
  confirmPayment: (
    bookingId: string,
    method: PaymentMethod,
    advanceAmount: number
  ) => { ok: boolean; receiptId?: string; error?: string };
  toggleSavedPujari: (pujariId: string) => void;
  toggleFestivalReminders: (enabled: boolean) => void;
  acceptBooking: (id: string) => void;
  rejectBooking: (id: string) => void;
  markCompleted: (id: string) => void;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

const initialBookings: Booking[] = [
  {
    id: 'b1',
    bookingId: 'PC-2026-1201',
    devoteeName: 'Srinivas',
    pujariId: 'pujari-1',
    pujariName: 'Pt. Venkata Sharma',
    ritualId: 'griha-pravesha',
    ritualName: 'Griha Pravesha',
    date: '2026-02-24',
    timeSlot: '07:30 AM - 10:30 AM',
    location: 'Bengaluru',
    specialNotes: 'Please include vastu guidance.',
    materialsRequired: ['Kalasha', 'Ghee', 'Navadhanya'],
    mode: 'AT_HOME',
    estimatedPrice: 12000,
    advancePaid: 3000,
    status: 'ACCEPTED',
    createdAt: '2026-02-20T10:30:00.000Z',
    receiptId: 'RCPT-PC1201',
    moderationFlags: [],
    fraudRiskScore: 0,
  },
  {
    id: 'b2',
    bookingId: 'PC-2026-1202',
    devoteeName: 'Kavya',
    pujariId: 'pujari-2',
    pujariName: 'Acharya Madhusudhan',
    ritualId: 'satyanarayana-puja',
    ritualName: 'Satyanarayana Puja',
    date: '2026-02-26',
    timeSlot: '06:00 PM - 08:30 PM',
    location: 'Mysuru',
    specialNotes: 'Need Telugu sankalpam.',
    materialsRequired: ['Tulsi', 'Bananas', 'Panchamrut'],
    mode: 'AT_HOME',
    estimatedPrice: 6800,
    advancePaid: 2000,
    status: 'PENDING',
    createdAt: '2026-02-21T09:00:00.000Z',
    moderationFlags: [],
    fraudRiskScore: 0,
  },
];

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}`;
}

function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  return digits.length > 10 ? digits.slice(-10) : digits;
}

function normalizeOtp(value: string): string {
  return value.replace(/\D/g, '');
}

function bookingId(): string {
  return `PC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [session, setSession] = useState<SessionUser | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [devoteeProfile, setDevoteeProfile] = useState<DevoteeProfile | null>(null);
  const [pujariProfile, setPujariProfile] = useState<PujariOnboardingProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [savedPujaris, setSavedPujaris] = useState<string[]>([]);
  const [festivalRemindersEnabled, setFestivalRemindersEnabled] = useState(true);

  const signIn = (payload: AuthPayload) => {
    try {
      if (payload.method === 'EMAIL') {
        const normalizedEmail = payload.email?.trim().toLowerCase() ?? '';
        if (!normalizedEmail || !isEmail(normalizedEmail)) {
          return { ok: false, error: 'Enter a valid email address.' };
        }
        if (!payload.password || payload.password.trim().length < 6) {
          return { ok: false, error: 'Password should be at least 6 characters.' };
        }
      }
      if (payload.method === 'PHONE_OTP') {
        const normalizedPhone = normalizePhone(payload.phone ?? '');
        const normalizedOtp = normalizeOtp(payload.otp ?? '');
        if (!normalizedPhone || !isPhone(normalizedPhone)) {
          return { ok: false, error: 'Enter a valid 10-digit phone number.' };
        }
        if (!/^\d{4,6}$/.test(normalizedOtp)) {
          return { ok: false, error: 'Enter a valid OTP.' };
        }
      }

      const user: SessionUser = {
        id: generateId('user'),
        role: payload.role,
        method: payload.method,
      };
      setSelectedRole(payload.role);
      setSession(user);
      registerPushNotifications();
      logInfo('Sign in success', user);
      return { ok: true };
    } catch (error) {
      logError('Sign in failure', error);
      return { ok: false, error: 'Unable to sign in right now.' };
    }
  };

  const signOut = () => {
    setSession(null);
    setSelectedRole(null);
    setAuthToken(null);
    logInfo('User signed out');
  };

  const saveDevoteeProfile = (profile: DevoteeProfile) => {
    const missing = validateRequiredFields({
      name: profile.name,
      gotra: profile.gotra,
    });
    if (missing.length > 0) {
      return { ok: false, missingFields: missing };
    }
    setDevoteeProfile(profile);
    return { ok: true };
  };

  const savePujariProfile = (profile: PujariOnboardingProfile) => {
    const missing = validateRequiredFields({
      name: profile.name,
      phone: profile.phone,
      email: profile.email,
      location: profile.location,
      experienceYears: profile.experienceYears,
      languages: profile.languages,
      specialties: profile.specialties,
    });
    if (missing.length > 0) {
      return { ok: false, missingFields: missing };
    }
    if (!isEmail(profile.email) || !isPhone(profile.phone)) {
      return { ok: false, error: 'Enter valid phone and email.' };
    }
    if (!['Madhwa', 'Smarta'].includes(profile.sampradaya)) {
      return { ok: false, error: 'Sampradaya must be Madhwa or Smartha.' };
    }
    setPujariProfile(profile);
    return { ok: true };
  };

  const createBookingDraft = (payload: BookingPayload): Booking => {
    const ritual = RITUALS.find((r) => r.id === payload.ritualId);
    const pujari = PUJARIS.find((p) => p.id === payload.pujariId);
    const estimate = ritual ? Math.round((ritual.minPrice + ritual.maxPrice) / 2) : 5000;
    const flags = moderationFlagsForText(payload.specialNotes);
    const draftCore: Omit<Booking, 'fraudRiskScore'> = {
      id: generateId('booking'),
      bookingId: bookingId(),
      devoteeName: payload.devoteeName,
      pujariId: payload.pujariId,
      pujariName: pujari?.name ?? 'Assigned Pujari',
      ritualId: payload.ritualId,
      ritualName: ritual?.name ?? 'Custom Puja',
      date: payload.date,
      timeSlot: payload.timeSlot,
      location: payload.location,
      specialNotes: payload.specialNotes,
      materialsRequired: payload.materialsRequired,
      mode: payload.mode,
      estimatedPrice: estimate,
      advancePaid: 0,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      moderationFlags: flags,
    };
    const draft = {
      ...draftCore,
      fraudRiskScore: evaluateFraudRisk(draftCore),
    };
    setBookings((prev) => [draft, ...prev]);
    return draft;
  };

  const confirmPayment = (id: string, method: PaymentMethod, advanceAmount: number) => {
    const target = bookings.find((booking) => booking.id === id);
    if (!target) {
      return { ok: false, error: 'Booking not found.' };
    }
    if (advanceAmount <= 0 || advanceAmount > target.estimatedPrice) {
      return { ok: false, error: 'Advance amount is invalid.' };
    }
    const receiptId = `RCPT-${Math.floor(100000 + Math.random() * 900000)}`;
    setBookings((prev) =>
      prev.map((booking) =>
        booking.id === id
          ? {
              ...booking,
              advancePaid: advanceAmount,
              status: 'CONFIRMED',
              receiptId,
            }
          : booking
      )
    );
    scheduleBookingReminder(target.bookingId, target.date);
    logInfo('Payment confirmed', { id, method, receiptId });
    return { ok: true, receiptId };
  };

  const toggleSavedPujari = (pujariId: string) => {
    setSavedPujaris((prev) =>
      prev.includes(pujariId) ? prev.filter((id) => id !== pujariId) : [...prev, pujariId]
    );
  };

  const toggleFestivalReminders = (enabled: boolean) => {
    setFestivalRemindersEnabled(enabled);
    scheduleFestivalReminders(enabled);
  };

  const acceptBooking = (id: string) => {
    setBookings((prev) =>
      prev.map((booking) => (booking.id === id ? { ...booking, status: 'ACCEPTED' } : booking))
    );
  };

  const rejectBooking = (id: string) => {
    setBookings((prev) =>
      prev.map((booking) => (booking.id === id ? { ...booking, status: 'REJECTED' } : booking))
    );
  };

  const markCompleted = (id: string) => {
    setBookings((prev) =>
      prev.map((booking) => (booking.id === id ? { ...booking, status: 'COMPLETED' } : booking))
    );
  };

  const value = useMemo<AppContextValue>(
    () => ({
      selectedRole,
      session,
      authToken,
      devoteeProfile,
      pujariProfile,
      bookings,
      savedPujaris,
      festivalRemindersEnabled,
      setSelectedRole,
      setAuthToken,
      signIn,
      signOut,
      saveDevoteeProfile,
      savePujariProfile,
      createBookingDraft,
      confirmPayment,
      toggleSavedPujari,
      toggleFestivalReminders,
      acceptBooking,
      rejectBooking,
      markCompleted,
    }),
    [
      selectedRole,
      session,
      authToken,
      devoteeProfile,
      pujariProfile,
      bookings,
      savedPujaris,
      festivalRemindersEnabled,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppState must be used inside AppProvider.');
  }
  return context;
}
