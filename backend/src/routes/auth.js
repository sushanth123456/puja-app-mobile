const express = require('express');
const { z } = require('zod');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const config = require('../config');
const asyncHandler = require('../utils/async-handler');
const { hashSecret, compareSecret } = require('../utils/password');
const { generateOtp, normalizePhone } = require('../utils/otp');
const { sendOtpSms } = require('../services/sms');
const { signAccessToken } = require('../utils/jwt');
const { verifyGoogleIdToken, verifyAppleIdentityToken } = require('../services/oauth');

const router = express.Router();

const sendOtpSchema = z.object({
  phone: z.string().min(10),
});

const signInSchema = z.object({
  role: z.enum(['DEVOTEE', 'PUJARI', 'ADMIN']),
  method: z.enum(['PHONE_OTP', 'EMAIL', 'GOOGLE', 'APPLE']),
  phone: z.string().optional(),
  otp: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
});

const emailRegisterSchema = z.object({
  role: z.enum(['DEVOTEE', 'PUJARI', 'ADMIN']),
  email: z.string().email(),
  password: z.string().min(8),
});

const googleSchema = z.object({
  role: z.enum(['DEVOTEE', 'PUJARI', 'ADMIN']),
  idToken: z.string().min(20),
});

const appleSchema = z.object({
  role: z.enum(['DEVOTEE', 'PUJARI', 'ADMIN']),
  identityToken: z.string().min(20),
});

async function getUserByEmail(email) {
  const result = await db.query('SELECT * FROM users WHERE email = $1 LIMIT 1', [email]);
  return result.rows[0] || null;
}

async function getUserByPhone(phone) {
  const result = await db.query('SELECT * FROM users WHERE phone = $1 LIMIT 1', [phone]);
  return result.rows[0] || null;
}

async function createUser(payload) {
  const id = uuidv4();
  const result = await db.query(
    `INSERT INTO users (id, role, email, phone, password_hash, email_verified, phone_verified)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      id,
      payload.role,
      payload.email || null,
      payload.phone || null,
      payload.passwordHash || null,
      Boolean(payload.emailVerified),
      Boolean(payload.phoneVerified),
    ]
  );
  return result.rows[0];
}

async function upsertUserRole(userId, role) {
  await db.query('UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2', [role, userId]);
}

function buildAuthResponse(user) {
  const token = signAccessToken({
    userId: user.id,
    role: user.role,
    email: user.email,
    phone: user.phone,
  });
  return {
    token,
    user: {
      id: user.id,
      role: user.role,
      email: user.email,
      phone: user.phone,
    },
  };
}

router.post(
  '/register-email',
  asyncHandler(async (req, res) => {
    const payload = emailRegisterSchema.parse(req.body);
    const email = payload.email.trim().toLowerCase();
    const existing = await getUserByEmail(email);
    if (existing) {
      return res.status(409).json({ message: 'Email already registered.' });
    }
    const passwordHash = await hashSecret(payload.password);
    const user = await createUser({
      role: payload.role,
      email,
      passwordHash,
      emailVerified: false,
      phoneVerified: false,
    });
    return res.status(201).json({ data: buildAuthResponse(user) });
  })
);

router.post(
  '/send-otp',
  asyncHandler(async (req, res) => {
    const payload = sendOtpSchema.parse(req.body);
    const phone = normalizePhone(payload.phone);
    if (phone.length !== 10) {
      return res.status(400).json({ message: 'Enter a valid 10-digit phone number.' });
    }
    let user = await getUserByPhone(phone);
    if (!user) {
      user = await createUser({
        role: 'DEVOTEE',
        phone,
        phoneVerified: false,
      });
    }
    const otpCode = generateOtp(6);
    const codeHash = await hashSecret(otpCode);
    const challengeId = uuidv4();
    const expiresAt = new Date(Date.now() + config.otpTtlMinutes * 60 * 1000);

    await db.query(
      `INSERT INTO otp_challenges (id, user_id, channel, code_hash, expires_at, attempts)
       VALUES ($1, $2, 'SMS', $3, $4, 0)`,
      [challengeId, user.id, codeHash, expiresAt.toISOString()]
    );

    await sendOtpSms(phone, otpCode);
    return res.status(200).json({ data: { challengeId } });
  })
);

router.post(
  '/sign-in',
  asyncHandler(async (req, res) => {
    const payload = signInSchema.parse(req.body);

    if (payload.method === 'EMAIL') {
      const email = String(payload.email || '').trim().toLowerCase();
      const password = String(payload.password || '');
      const user = await getUserByEmail(email);
      if (!user || !user.password_hash) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }
      const ok = await compareSecret(password, user.password_hash);
      if (!ok) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }
      await upsertUserRole(user.id, payload.role);
      const fresh = await getUserByEmail(email);
      return res.status(200).json({ data: buildAuthResponse(fresh) });
    }

    if (payload.method === 'PHONE_OTP') {
      const phone = normalizePhone(payload.phone || '');
      const otp = String(payload.otp || '').replace(/\D/g, '');
      if (phone.length !== 10 || otp.length < 4 || otp.length > 6) {
        return res.status(400).json({ message: 'Invalid phone or OTP.' });
      }
      const user = await getUserByPhone(phone);
      if (!user) {
        return res.status(404).json({ message: 'Phone number not found.' });
      }

      const challengeResult = await db.query(
        `SELECT * FROM otp_challenges
         WHERE user_id = $1
           AND channel = 'SMS'
           AND consumed_at IS NULL
         ORDER BY created_at DESC
         LIMIT 1`,
        [user.id]
      );
      const challenge = challengeResult.rows[0];
      if (!challenge) {
        return res.status(401).json({ message: 'OTP challenge not found. Request OTP again.' });
      }
      if (new Date(challenge.expires_at).getTime() < Date.now()) {
        return res.status(401).json({ message: 'OTP expired. Request OTP again.' });
      }
      if (challenge.attempts >= config.otpMaxAttempts) {
        return res.status(429).json({ message: 'Maximum OTP attempts exceeded. Request new OTP.' });
      }

      const otpMatch = await compareSecret(otp, challenge.code_hash);
      if (!otpMatch) {
        await db.query('UPDATE otp_challenges SET attempts = attempts + 1 WHERE id = $1', [challenge.id]);
        return res.status(401).json({ message: 'Invalid OTP.' });
      }

      await db.query(
        `UPDATE otp_challenges
         SET consumed_at = NOW()
         WHERE id = $1`,
        [challenge.id]
      );
      await db.query(
        `UPDATE users
         SET phone_verified = TRUE, role = $1, updated_at = NOW()
         WHERE id = $2`,
        [payload.role, user.id]
      );

      const fresh = await getUserByPhone(phone);
      return res.status(200).json({ data: buildAuthResponse(fresh) });
    }

    return res.status(400).json({ message: 'Use /auth/google or /auth/apple for social login.' });
  })
);

router.post(
  '/google',
  asyncHandler(async (req, res) => {
    const payload = googleSchema.parse(req.body);
    const identity = await verifyGoogleIdToken(payload.idToken);
    let user = await getUserByEmail(identity.email);
    if (!user) {
      user = await createUser({
        role: payload.role,
        email: identity.email,
        emailVerified: identity.emailVerified,
      });
    } else {
      await db.query(
        `UPDATE users SET role = $1, email_verified = $2, updated_at = NOW() WHERE id = $3`,
        [payload.role, identity.emailVerified, user.id]
      );
      user = await getUserByEmail(identity.email);
    }
    return res.status(200).json({ data: buildAuthResponse(user) });
  })
);

router.post(
  '/apple',
  asyncHandler(async (req, res) => {
    const payload = appleSchema.parse(req.body);
    const identity = await verifyAppleIdentityToken(payload.identityToken);
    let user = await getUserByEmail(identity.email);
    if (!user) {
      user = await createUser({
        role: payload.role,
        email: identity.email,
        emailVerified: identity.emailVerified,
      });
    } else {
      await db.query(
        `UPDATE users SET role = $1, email_verified = $2, updated_at = NOW() WHERE id = $3`,
        [payload.role, identity.emailVerified, user.id]
      );
      user = await getUserByEmail(identity.email);
    }
    return res.status(200).json({ data: buildAuthResponse(user) });
  })
);

module.exports = router;
