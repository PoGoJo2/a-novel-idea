import { DateTime } from 'luxon';

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// The time zone to show times in: the user's saved one, or the browser's
export const viewerZone = (user) => user?.timezone || DateTime.local().zoneName;

// Turns a weekly slot like { dayOfWeek: 4, startTime: '19:00', timezone: 'America/New_York' }
// into text like "Thu 7:00 PM" in the viewer's own time zone.
export function slotLabel(slot, zone) {
  const [hour, minute] = slot.startTime.split(':').map(Number);
  const weekday = slot.dayOfWeek === 0 ? 7 : slot.dayOfWeek; // luxon: Monday = 1 ... Sunday = 7

  let time = DateTime.now().setZone(slot.timezone).set({ hour, minute, second: 0, millisecond: 0 });
  time = time.plus({ days: (weekday - time.weekday + 7) % 7 });

  const shown = time.setZone(zone);
  return (shown.isValid ? shown : time).toFormat('ccc h:mm a');
}

// Cover colors come from the book; these become CSS variables used by the styles
export const bookStyle = (book) => ({
  '--accent': book.accentColors?.accent || '#22365C',
  '--ribbon': book.accentColors?.ribbon || '#D8B25A',
});
