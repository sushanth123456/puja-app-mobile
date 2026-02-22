# PujaConnect Backend

Production-oriented Express + PostgreSQL backend for auth, OTP, social login hooks, profiles, and bookings.

## 1) Setup

```bash
cd backend
npm install
cp .env.example .env
```

## 2) Configure `.env`

Minimum required:

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/pujaconnect
JWT_SECRET=replace-with-long-random-secret
CORS_ALLOWED_ORIGINS=http://localhost:8081
```

For production OTP:

```env
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_VERIFY_SERVICE_SID=...
```

For social login verification:

```env
GOOGLE_CLIENT_ID=...
APPLE_SERVICE_ID=...
APPLE_BUNDLE_ID=...
```

## 3) Create DB Schema

Run:

```bash
psql "$DATABASE_URL" -f schema.sql
```

## 4) Start API

```bash
npm run dev
```

API default: `http://localhost:8080`

## Implemented Endpoints

- `GET /health`
- `POST /auth/register-email`
- `POST /auth/send-otp`
- `POST /auth/sign-in`
- `POST /auth/google`
- `POST /auth/apple`
- `POST /devotees/profile` (Bearer token)
- `POST /pujaris/profile` (Bearer token)
- `GET /pujaris`
- `POST /bookings` (Bearer token)
- `GET /bookings` (Bearer token)
- `PATCH /bookings/:id/status` (Bearer token)

## Security Notes

- Passwords and OTPs are hashed with bcrypt.
- OTP expiry and max-attempt enforcement enabled.
- CORS allowlist is enforced.
- HTTPS is enforced in production mode.
- JWT required for protected routes.
