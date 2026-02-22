# PujaConnect Mobile App

Expo Router app for devotees and pujaris to authenticate, create profiles, and manage bookings.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create env file from sample:

```bash
cp .env.example .env
```

3. Configure production backend URL (HTTPS only):

```env
EXPO_PUBLIC_API_BASE_URL=https://api.pujaconnect.com
EXPO_PUBLIC_API_TIMEOUT_MS=10000
```

4. Start the app:

```bash
npm run start
```

5. Start backend (required for real OTP/social login):

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

## Launch Readiness (Current)

- Role-based auth: implemented at app layer.
- OTP + email validation flow: implemented in UI/context.
- Booking status tracking: implemented with lifecycle states.
- Pujari verification label: surfaced in listing cards.
- Navigation: stack headers + back navigation for non-tab routes.
- Secrets: no secrets hardcoded in app code.
- Production env: `EXPO_PUBLIC_*` config added.
- HTTPS backend enforcement: runtime check in `lib/config.ts`.
- Dynamic DB model: SQL schema added in `backend/schema.sql`.

## Required Backend Before Public Launch

- Store passwords using strong hash (Argon2id or bcrypt with strong cost).
- Enforce OTP TTL, attempt limits, and replay protection.
- Persist enrolled devotees and pujaris using `backend/schema.sql`.
- Configure CORS allowlist for app domains only.
- Serve APIs over HTTPS only.
- Return consistent API errors for client rendering.

## Important Files

- `app/auth.tsx`: auth screen and OTP UX.
- `app/profile-setup.tsx`: devotee/pujari onboarding.
- `app/pujaris/[pujaId].tsx`: filtered pujari listing + photos.
- `context/AppContext.tsx`: app state and validations.
- `services/api.ts`: backend API integration helpers.
- `lib/config.ts`: env validation and HTTPS enforcement.
- `backend/schema.sql`: DB schema for production backend.
- `backend/src/*`: Express API (auth, profiles, bookings).
