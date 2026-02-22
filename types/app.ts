export type Role = 'DEVOTEE' | 'PUJARI';

export type AuthMethod = 'EMAIL' | 'PHONE_OTP' | 'GOOGLE' | 'APPLE';

export type Sampradaya = 'Madhwa' | 'Smarta' | 'Vaishnava' | 'Shaiva' | 'Other';

export type Ritual = {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  materials: string[];
  minPrice: number;
  maxPrice: number;
};

export type Review = {
  id: string;
  devoteeName: string;
  rating: number;
  comment: string;
  photoProof?: string;
};

export type PujariProfile = {
  id: string;
  name: string;
  photoUrl?: string;
  bio: string;
  yearsExperience: number;
  sampradaya: Sampradaya;
  languages: string[];
  ritualSpecialties: string[];
  location: string;
  rating: number;
  reviewCount: number;
  pricePerHour: number;
  availability: string[];
  verified: boolean;
  reviews: Review[];
};

export type DevoteeProfile = {
  name: string;
  gotra: string;
};

export type PujariOnboardingProfile = {
  name: string;
  photoUrl?: string;
  phone: string;
  email: string;
  location: string;
  experienceYears: string;
  languages: string;
  sampradaya: Sampradaya;
  specialties: string;
};

export type BookingStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'CONFIRMED'
  | 'COMPLETED';

export type PaymentMethod = 'UPI' | 'CARD' | 'NETBANKING' | 'WALLET';

export type Booking = {
  id: string;
  bookingId: string;
  devoteeName: string;
  pujariId: string;
  pujariName: string;
  ritualId: string;
  ritualName: string;
  date: string;
  timeSlot: string;
  location: string;
  specialNotes: string;
  materialsRequired: string[];
  mode: 'ONLINE' | 'AT_HOME';
  estimatedPrice: number;
  advancePaid: number;
  status: BookingStatus;
  createdAt: string;
  receiptId?: string;
  moderationFlags: string[];
  fraudRiskScore: number;
};

export type PujariFilter = {
  sampradaya?: Sampradaya;
  location?: string;
  language?: string;
  minExperience?: number;
  minRating?: number;
  maxPrice?: number;
  availability?: string;
};

export type SessionUser = {
  id: string;
  role: Role;
  method: AuthMethod;
};
