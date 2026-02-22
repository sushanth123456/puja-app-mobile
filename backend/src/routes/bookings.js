const express = require('express');
const { z } = require('zod');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const asyncHandler = require('../utils/async-handler');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const createBookingSchema = z.object({
  pujariId: z.string().uuid(),
  ritualId: z.string().min(1),
  ritualName: z.string().min(1),
  date: z.string().min(10),
  timeSlot: z.string().min(3),
  location: z.string().min(2),
  specialNotes: z.string().optional(),
  materialsRequired: z.array(z.string()).optional(),
  mode: z.enum(['ONLINE', 'AT_HOME']),
  estimatedPrice: z.number().nonnegative(),
});

const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'CONFIRMED', 'COMPLETED']),
});

function bookingCode() {
  const year = new Date().getFullYear();
  return `PC-${year}-${Math.floor(1000 + Math.random() * 9000)}`;
}

router.post(
  '/bookings',
  requireAuth,
  asyncHandler(async (req, res) => {
    const payload = createBookingSchema.parse(req.body);
    const id = uuidv4();
    const bookingId = bookingCode();
    const devoteeUserId = req.user.userId;
    const result = await db.query(
      `INSERT INTO bookings
       (id, booking_id, devotee_user_id, pujari_user_id, ritual_id, ritual_name, date, time_slot, location, mode, special_notes, materials_required, estimated_price, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7::date, $8, $9, $10, $11, $12, $13, 'PENDING', NOW(), NOW())
       RETURNING *`,
      [
        id,
        bookingId,
        devoteeUserId,
        payload.pujariId,
        payload.ritualId,
        payload.ritualName,
        payload.date,
        payload.timeSlot,
        payload.location,
        payload.mode,
        payload.specialNotes || '',
        (payload.materialsRequired || []).join(','),
        payload.estimatedPrice,
      ]
    );
    return res.status(201).json({ data: result.rows[0] });
  })
);

router.get(
  '/bookings',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const role = req.user.role;
    const column = role === 'PUJARI' ? 'pujari_user_id' : 'devotee_user_id';
    const result = await db.query(
      `SELECT * FROM bookings WHERE ${column} = $1 ORDER BY created_at DESC`,
      [userId]
    );
    return res.status(200).json({ data: result.rows });
  })
);

router.patch(
  '/bookings/:id/status',
  requireAuth,
  asyncHandler(async (req, res) => {
    const payload = updateStatusSchema.parse(req.body);
    const id = req.params.id;
    const result = await db.query(
      `UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [payload.status, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Booking not found.' });
    }
    return res.status(200).json({ data: result.rows[0] });
  })
);

module.exports = router;
