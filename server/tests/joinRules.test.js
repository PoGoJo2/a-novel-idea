// Unit tests for the joining rules and reading goals. The database is replaced with fake data,
// so these run instantly and need no MongoDB.
jest.mock('../src/models/Meeting', () => ({ find: jest.fn(), updateMany: jest.fn() }));
jest.mock('../src/models/ReadingGroup', () => ({ find: jest.fn() }));
jest.mock('../src/models/Membership', () => ({}));
jest.mock('../src/models/Book', () => ({ findById: jest.fn(), distinct: jest.fn() }));

const Meeting = require('../src/models/Meeting');
const ReadingGroup = require('../src/models/ReadingGroup');
const Book = require('../src/models/Book');
const { joinStatus, listGoals, browseStatus, JOIN_CLOSES_WEEK } = require('../src/services/goalService');

// Meetings with a real goal for weeks 1..n (one meeting per week is enough for the check)
const meetingsFor = (groupId, goals) => goals.map((chapters, i) => ({ group: groupId, weekNumber: i + 1, chapters }));
const fakeMeetingQuery = (rows) => ({ select: jest.fn().mockResolvedValue(rows) });

const group = (over = {}) => ({ _id: 'g1', leader: 'u1', totalWeeks: 3, currentWeek: 0, status: 'open', ...over });

// By default the book is on offer (not retired) and no books are retired
const fakeBook = (retired) => ({ select: jest.fn().mockResolvedValue({ retired }) });
beforeEach(() => {
  jest.clearAllMocks();
  Book.findById.mockReturnValue(fakeBook(false));
  Book.distinct.mockResolvedValue([]);
});

describe('joinStatus', () => {
  test('joining closes when week 3 begins', async () => {
    expect(JOIN_CLOSES_WEEK).toBe(3);
    const result = await joinStatus(group({ currentWeek: 3 }));
    expect(result.open).toBe(false);
    expect(result.reason).toMatch(/closed/i);
  });

  test('a finished group is closed', async () => {
    const result = await joinStatus(group({ status: 'finished' }));
    expect(result.open).toBe(false);
  });

  test('a group for a retired book is closed', async () => {
    Book.findById.mockReturnValue(fakeBook(true));
    const result = await joinStatus(group());
    expect(result.open).toBe(false);
    expect(result.reason).toMatch(/no longer offered/i);
  });

  test('a group that is still finding a leader is not open yet', async () => {
    const result = await joinStatus(group({ leader: null }));
    expect(result.open).toBe(false);
    expect(result.reason).toMatch(/finding a leader/i);
  });

  test('a group with an unfinished reading plan is not open yet', async () => {
    Meeting.find.mockReturnValue(fakeMeetingQuery(meetingsFor('g1', ['Chapters 1-5', 'Chapters 6-11']))); // week 3 missing
    const result = await joinStatus(group());
    expect(result.open).toBe(false);
    expect(result.reason).toMatch(/plan/i);
  });

  test('placeholder text like "Week 2" does not count as a goal', async () => {
    Meeting.find.mockReturnValue(fakeMeetingQuery(meetingsFor('g1', ['Chapters 1-5', 'Week 2', 'Week 3'])));
    const result = await joinStatus(group());
    expect(result.open).toBe(false);
  });

  test('a complete plan before week 3 is open', async () => {
    Meeting.find.mockReturnValue(fakeMeetingQuery(meetingsFor('g1', ['Chapters 1-5', 'Chapters 6-11', 'Chapters 12-17'])));
    const result = await joinStatus(group({ currentWeek: 2 }));
    expect(result.open).toBe(true);
  });
});

describe('listGoals', () => {
  test('returns one goal per week, hiding placeholders', async () => {
    Meeting.find.mockReturnValue(fakeMeetingQuery([
      { weekNumber: 1, chapters: 'Chapters 1-5' },
      { weekNumber: 1, chapters: 'Chapters 1-5' }, // second time option, same goal
      { weekNumber: 2, chapters: 'Week 2' },
    ]));
    const goals = await listGoals('g1');
    expect(goals).toEqual([
      { weekNumber: 1, chapters: 'Chapters 1-5' },
      { weekNumber: 2, chapters: '' },
    ]);
  });
});

describe('browseStatus', () => {
  test('sorts groups into open, coming soon and started', async () => {
    const groups = [
      group({ _id: 'open', totalWeeks: 2 }),
      group({ _id: 'soon', totalWeeks: 2 }),
      group({ _id: 'late', totalWeeks: 2, currentWeek: 3 }),
    ];
    ReadingGroup.find.mockReturnValue(fakeMeetingQuery(groups));
    Meeting.find.mockReturnValue(fakeMeetingQuery([
      ...meetingsFor('open', ['Chapters 1-5', 'Chapters 6-11']),
      ...meetingsFor('soon', ['Chapters 1-5', '']),
    ]));
    const result = await browseStatus();
    expect(result.open).toEqual(['open']);
    expect(result.comingSoon).toEqual(['soon']);
    expect(result.started).toEqual(['late']);
    expect(result.needsLeader).toEqual([]);
  });
});
