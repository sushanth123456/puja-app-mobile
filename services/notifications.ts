import { logInfo } from '@/services/logger';

export function registerPushNotifications() {
  // Placeholder for Expo Notifications setup.
  logInfo('Push notifications registration requested');
}

export function scheduleBookingReminder(bookingId: string, date: string) {
  logInfo('Booking reminder scheduled', { bookingId, date });
}

export function scheduleFestivalReminders(enabled: boolean) {
  logInfo('Festival reminders toggled', { enabled });
}
