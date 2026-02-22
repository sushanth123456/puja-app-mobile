-- Core auth users
CREATE TABLE users (
  id UUID PRIMARY KEY,
  role VARCHAR(16) NOT NULL CHECK (role IN ('DEVOTEE', 'PUJARI', 'ADMIN')),
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20) UNIQUE,
  password_hash VARCHAR(255),
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- OTP challenge tracking for auth security
CREATE TABLE otp_challenges (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  channel VARCHAR(16) NOT NULL CHECK (channel IN ('SMS', 'EMAIL')),
  code_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  consumed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_otp_challenges_user ON otp_challenges(user_id);
CREATE INDEX idx_otp_challenges_expires ON otp_challenges(expires_at);

-- Devotee onboarding profile
CREATE TABLE devotee_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(120) NOT NULL,
  gotra VARCHAR(120) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Pujari onboarding + verification
CREATE TABLE pujari_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(120) NOT NULL,
  location VARCHAR(120) NOT NULL,
  experience_years INTEGER NOT NULL CHECK (experience_years >= 0),
  languages TEXT NOT NULL,
  sampradaya VARCHAR(40) NOT NULL CHECK (sampradaya IN ('Madhwa', 'Smarta')),
  specialties TEXT NOT NULL,
  verification_status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (verification_status IN ('PENDING', 'VERIFIED', 'REJECTED')),
  verification_notes TEXT,
  photo_url TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Booking and lifecycle states
CREATE TABLE bookings (
  id UUID PRIMARY KEY,
  booking_id VARCHAR(40) UNIQUE NOT NULL,
  devotee_user_id UUID NOT NULL REFERENCES users(id),
  pujari_user_id UUID NOT NULL REFERENCES users(id),
  ritual_id VARCHAR(80) NOT NULL,
  ritual_name VARCHAR(150) NOT NULL,
  date DATE NOT NULL,
  time_slot VARCHAR(80) NOT NULL,
  location TEXT NOT NULL,
  mode VARCHAR(12) NOT NULL CHECK (mode IN ('ONLINE', 'AT_HOME')),
  special_notes TEXT,
  materials_required TEXT,
  estimated_price NUMERIC(10, 2) NOT NULL,
  advance_paid NUMERIC(10, 2) NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'CONFIRMED', 'COMPLETED')),
  receipt_id VARCHAR(40),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bookings_devotee ON bookings(devotee_user_id);
CREATE INDEX idx_bookings_pujari ON bookings(pujari_user_id);
CREATE INDEX idx_bookings_status ON bookings(status);
