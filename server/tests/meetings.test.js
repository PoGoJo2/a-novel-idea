// Unit tests for the weekly meeting schedule (no database needed).
const { generateMeetings } = require('../src/services/meetingService');

const makeGroup = (overrides = {}) => ({
  _id: 'group1',
  startDate: new Date('2026-11-01T00:00:00.000Z'), // a Sunday
  totalWeeks: 6,
  sessionMinutes: 60,
  timeSlots: [
    { _id: 'slotA', dayOfWeek: 4, startTime: '19:00', timezone: 'America/New_York', meetingLink: 'https://example.com/a' },
    { _id: 'slotB', dayOfWeek: 0, startTime: '16:00', timezone: 'America/New_York', meetingLink: 'https://example.com/b' },
  ],
  ...overrides,
});

describe('generateMeetings', () => {
  test('makes one meeting per time option per week', () => {
    const meetings = generateMeetings(makeGroup());
    expect(meetings).toHaveLength(12); // 2 options x 6 weeks
  });

  test('numbers the weeks 1 to totalWeeks for each option', () => {
    const meetings = generateMeetings(makeGroup()).filter((m) => m.slotId === 'slotA');
    expect(meetings.map((m) => m.weekNumber)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  test('meetings are exactly one week apart', () => {
    const meetings = generateMeetings(makeGroup()).filter((m) => m.slotId === 'slotA');
    // Across the November daylight-saving change the gap is 7 days +/- 1 hour in UTC
    for (let i = 1; i < meetings.length; i += 1) {
      const hours = (meetings[i].startsAtUtc - meetings[i - 1].startsAtUtc) / 36e5;
      expect([167, 168, 169]).toContain(hours);
    }
  });

  test('a 7:00 PM Thursday meeting stays at 7:00 PM local time all through the run', () => {
    const meetings = generateMeetings(makeGroup()).filter((m) => m.slotId === 'slotA');
    meetings.forEach((m) => {
      const local = new Date(m.startsAtUtc.toLocaleString('en-US', { timeZone: 'America/New_York' }));
      expect(local.getHours()).toBe(19);
      expect(local.getDay()).toBe(4); // Thursday
    });
  });

  test('the first meeting is on or after the start date', () => {
    const group = makeGroup();
    generateMeetings(group).forEach((m) => {
      expect(m.startsAtUtc.getTime()).toBeGreaterThanOrEqual(group.startDate.getTime());
    });
  });

  test('copies the group settings onto each meeting', () => {
    const [first] = generateMeetings(makeGroup());
    expect(first.group).toBe('group1');
    expect(first.durationMinutes).toBe(60);
    expect(first.meetingLink).toMatch(/^https:\/\/example\.com\//);
  });
});
