const { DateTime } = require('luxon');

/**
 * Builds the weekly Meeting records for a reading group, one per time option per week.
 * Times are converted to UTC, but the weekly pattern keeps the group's time zone, so a
 * "7:00 PM Thursday" meeting stays at 7:00 PM local time when daylight saving changes.
 */
const generateMeetings = (group) => {
  // startDate is treated as a calendar date (the UTC date part), not an instant
  const startIso = DateTime.fromJSDate(group.startDate, { zone: 'utc' }).toISODate();
  const meetings = [];

  group.timeSlots.forEach((slot) => {
    const [hour, minute] = slot.startTime.split(':').map(Number);
    const luxonWeekday = slot.dayOfWeek === 0 ? 7 : slot.dayOfWeek; // luxon: Monday = 1 ... Sunday = 7

    // First occurrence of the chosen weekday on or after the start date, in the slot's time zone
    let first = DateTime.fromISO(startIso, { zone: slot.timezone });
    const daysToAdd = (luxonWeekday - first.weekday + 7) % 7;
    first = first.plus({ days: daysToAdd }).set({ hour, minute, second: 0, millisecond: 0 });

    for (let week = 1; week <= group.totalWeeks; week += 1) {
      meetings.push({
        group: group._id,
        slotId: slot._id,
        weekNumber: week,
        startsAtUtc: first.plus({ weeks: week - 1 }).toUTC().toJSDate(),
        durationMinutes: group.sessionMinutes,
        meetingLink: slot.meetingLink,
        chapters: `Week ${week}`,
      });
    }
  });

  return meetings;
};

module.exports = { generateMeetings };
