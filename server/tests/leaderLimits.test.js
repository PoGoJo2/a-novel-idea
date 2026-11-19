// Unit tests for the leader scheduling rules: no double-booked times, at most 3 classes a day.
jest.mock('../src/models/ReadingGroup', () => ({}));
jest.mock('../src/models/LeaderRequest', () => ({}));
jest.mock('../src/models/Membership', () => ({}));
jest.mock('../src/services/goalService', () => ({ completePlans: jest.fn() }));

const { scheduleProblem, MAX_PER_DAY } = require('../src/services/leaderService');

const cls = (id, title, slots, startDate = '2026-12-01', totalWeeks = 6) => ({
  _id: id, book: { title }, startDate, totalWeeks,
  timeSlots: slots.map(([dayOfWeek, startTime]) => ({ dayOfWeek, startTime })),
});

describe('leader scheduling limits', () => {
  test('the daily limit is 3', () => expect(MAX_PER_DAY).toBe(3));

  test('a class at the same day and time is refused', () => {
    const mine = [cls('1', 'Dune', [[1, '19:00']])];
    expect(scheduleProblem(cls('2', 'Emma', [[1, '19:00']]), mine)).toMatch(/already lead Dune on Monday at 7:00 PM/);
  });

  test('a class that runs into another one is refused', () => {
    const mine = [cls('1', 'Dune', [[1, '19:00']])];
    expect(scheduleProblem(cls('2', 'Emma', [[1, '19:30']]), mine)).toMatch(/runs into the 7:30 PM meeting/);
  });

  test('back-to-back classes are allowed', () => {
    const mine = [cls('1', 'Dune', [[1, '19:00']])];
    expect(scheduleProblem(cls('2', 'Emma', [[1, '20:00']]), mine)).toBe('');
  });

  test('a fourth class on the same day is refused', () => {
    const mine = [cls('1', 'A', [[1, '09:00']]), cls('2', 'B', [[1, '12:00']]), cls('3', 'C', [[1, '15:00']])];
    expect(scheduleProblem(cls('4', 'D', [[1, '18:00']]), mine, 'Lovie')).toMatch(/Lovie already has 3 classes on Monday/);
  });

  test('a third class on the same day is allowed', () => {
    const mine = [cls('1', 'A', [[1, '09:00']]), cls('2', 'B', [[1, '12:00']])];
    expect(scheduleProblem(cls('3', 'C', [[1, '18:00']]), mine)).toBe('');
  });

  test('classes whose dates do not overlap never clash', () => {
    const mine = [cls('1', 'Dune', [[1, '19:00']], '2026-01-05', 6)];
    expect(scheduleProblem(cls('2', 'Emma', [[1, '19:00']], '2026-06-01', 6), mine)).toBe('');
  });

  test('editing a class does not clash with itself', () => {
    const own = cls('1', 'Dune', [[1, '19:00']]);
    expect(scheduleProblem(own, [own])).toBe('');
  });
});
