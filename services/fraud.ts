import { Booking } from '@/types/app';

export function evaluateFraudRisk(booking: Omit<Booking, 'fraudRiskScore'>): number {
  let score = 0;
  if (booking.mode === 'ONLINE' && booking.estimatedPrice > 15000) {
    score += 20;
  }
  if (booking.specialNotes.toLowerCase().includes('urgent')) {
    score += 10;
  }
  if (booking.advancePaid < booking.estimatedPrice * 0.1) {
    score += 15;
  }
  if (booking.moderationFlags.length > 0) {
    score += 35;
  }
  return Math.min(score, 100);
}

export function moderationFlagsForText(notes: string): string[] {
  const lowered = notes.toLowerCase();
  const flags: string[] = [];
  if (lowered.includes('outside app payment')) {
    flags.push('payment-bypass-risk');
  }
  if (lowered.includes('no id')) {
    flags.push('identity-risk');
  }
  return flags;
}
