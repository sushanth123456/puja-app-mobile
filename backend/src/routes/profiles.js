const express = require('express');
const { z } = require('zod');
const db = require('../db');
const asyncHandler = require('../utils/async-handler');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const devoteeSchema = z.object({
  name: z.string().min(2),
  gotra: z.string().min(1),
});

const pujariSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(10),
  email: z.string().email(),
  location: z.string().min(2),
  experienceYears: z.string().min(1),
  languages: z.string().min(2),
  sampradaya: z.enum(['Madhwa', 'Smarta']),
  specialties: z.string().min(2),
  photoUrl: z.string().url().optional().or(z.literal('')),
});

router.post(
  '/devotees/profile',
  requireAuth,
  asyncHandler(async (req, res) => {
    const payload = devoteeSchema.parse(req.body);
    const userId = req.user.userId;

    await db.query(
      `INSERT INTO devotee_profiles (user_id, name, gotra, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       ON CONFLICT (user_id) DO UPDATE SET
         name = EXCLUDED.name,
         gotra = EXCLUDED.gotra,
         updated_at = NOW()`,
      [userId, payload.name.trim(), payload.gotra.trim()]
    );

    return res.status(200).json({ data: { id: userId } });
  })
);

router.post(
  '/pujaris/profile',
  requireAuth,
  asyncHandler(async (req, res) => {
    const payload = pujariSchema.parse(req.body);
    const userId = req.user.userId;

    await db.query(
      `UPDATE users
       SET role = 'PUJARI',
           phone = $1,
           email = $2,
           updated_at = NOW()
       WHERE id = $3`,
      [payload.phone.replace(/\D/g, '').slice(-10), payload.email.trim().toLowerCase(), userId]
    );

    await db.query(
      `INSERT INTO pujari_profiles
         (user_id, name, location, experience_years, languages, sampradaya, specialties, photo_url, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NULLIF($8, ''), NOW(), NOW())
       ON CONFLICT (user_id) DO UPDATE SET
         name = EXCLUDED.name,
         location = EXCLUDED.location,
         experience_years = EXCLUDED.experience_years,
         languages = EXCLUDED.languages,
         sampradaya = EXCLUDED.sampradaya,
         specialties = EXCLUDED.specialties,
         photo_url = EXCLUDED.photo_url,
         updated_at = NOW()`,
      [
        userId,
        payload.name.trim(),
        payload.location.trim(),
        Number(payload.experienceYears),
        payload.languages.trim(),
        payload.sampradaya,
        payload.specialties.trim(),
        payload.photoUrl || '',
      ]
    );

    return res.status(200).json({ data: { id: userId } });
  })
);

router.get(
  '/pujaris',
  asyncHandler(async (req, res) => {
    const sampradaya = req.query.sampradaya ? String(req.query.sampradaya) : null;
    const params = [];
    let where = '';
    if (sampradaya && (sampradaya === 'Madhwa' || sampradaya === 'Smarta')) {
      params.push(sampradaya);
      where = `WHERE p.sampradaya = $${params.length}`;
    }

    const result = await db.query(
      `SELECT
         u.id,
         p.name,
         p.photo_url AS "photoUrl",
         '' AS bio,
         p.experience_years AS "yearsExperience",
         p.sampradaya,
         string_to_array(p.languages, ',') AS languages,
         string_to_array(p.specialties, ',') AS "ritualSpecialties",
         p.location,
         0::numeric AS rating,
         0::int AS "reviewCount",
         0::int AS "pricePerHour",
         ARRAY[]::text[] AS availability,
         (p.verification_status = 'VERIFIED') AS verified,
         ARRAY[]::json[] AS reviews
       FROM pujari_profiles p
       INNER JOIN users u ON u.id = p.user_id
       ${where}
       ORDER BY p.verification_status DESC, p.updated_at DESC`,
      params
    );

    return res.status(200).json({ data: result.rows });
  })
);

module.exports = router;
