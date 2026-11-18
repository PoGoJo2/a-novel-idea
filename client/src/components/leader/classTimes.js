// "Mon 7:00 PM" style text for a class's meeting times
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const timeText = (hhmm) => {
  const [h, m] = String(hhmm).split(':').map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};

export const slotText = (slot) => `${DAYS[slot.dayOfWeek]} ${timeText(slot.startTime)}`;
export const slotsText = (slots) => slots.map(slotText).join(', ');
