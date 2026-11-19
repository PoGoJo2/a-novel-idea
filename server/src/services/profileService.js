const User = require('../models/User');
const ReadingGroup = require('../models/ReadingGroup');
const AppError = require('../utils/AppError');
const { GENRES } = require('../models/Book');

const PHOTO_OK = /^(\/[\w\-/.]+\.(png|jpe?g|webp)|data:image\/(png|jpe?g|webp);base64,[A-Za-z0-9+/=]+)$/;

const formatProfile = (u) => ({
  photo: u.profile?.photo || '',
  bio: u.profile?.bio || '',
  history: u.profile?.history || '',
  interests: u.profile?.interests || [],
  favoriteReads: u.profile?.favoriteReads || '',
});

// Public list for "Meet the Leaders": profile + what they lead now + classes finished
const listLeaders = async () => {
  const leaders = await User.find({ role: 'leader', suspended: { $ne: true } }).select('name profile').sort({ name: 1 });
  const groups = await ReadingGroup.find({ leader: { $in: leaders.map((l) => l._id) } }).populate('book', 'title genre');
  return leaders.map((l) => {
    const mine = groups.filter((g) => String(g.leader) === String(l._id));
    const leading = mine.filter((g) => g.status !== 'finished' && g.book);
    return {
      id: l._id,
      name: l.name,
      ...formatProfile(l),
      leading: [...new Set(leading.map((g) => g.book.title))].sort(),
      finished: mine.length - leading.length,
    };
  });
};

// One leader's page: their profile and every class they lead now (with schedule), plus how many they finished
const getLeader = async (id) => {
  if (!/^[a-f0-9]{24}$/i.test(String(id))) throw new AppError('Leader not found', 404);
  const leader = await User.findOne({ _id: id, role: 'leader', suspended: { $ne: true } }).select('name profile');
  if (!leader) throw new AppError('Leader not found', 404);
  const groups = await ReadingGroup.find({ leader: leader._id }).populate('book', 'title author genre coverUrl accentColors');
  const active = groups.filter((g) => g.status !== 'finished' && g.book);
  const classes = active
    .map((g) => ({
      id: g._id,
      book: { id: g.book._id, title: g.book.title, author: g.book.author, genre: g.book.genre, coverUrl: g.book.coverUrl, accentColors: g.book.accentColors },
      startDate: g.startDate,
      currentWeek: g.currentWeek,
      totalWeeks: g.totalWeeks,
      timeSlots: g.timeSlots.map((t) => ({ dayOfWeek: t.dayOfWeek, startTime: t.startTime })),
    }))
    .sort((a, b) => a.book.title.localeCompare(b.book.title) || a.currentWeek - b.currentWeek);
  return { id: leader._id, name: leader.name, ...formatProfile(leader), classes, finished: groups.length - active.length };
};

const getMyProfile = async (user) => ({ name: user.name, ...formatProfile(user), genres: GENRES });

const updateMyProfile = async (user, body = {}) => {
  const me = await User.findById(user._id);
  if (!me) throw new AppError('Account not found', 404);
  const p = me.profile || {};
  if (body.photo !== undefined) {
    const photo = String(body.photo || '');
    if (photo && !PHOTO_OK.test(photo)) throw new AppError('That photo could not be used. Choose a JPG or PNG picture.', 400);
    if (photo.length > 400000) throw new AppError('That photo is too large. Choose a smaller picture.', 400);
    p.photo = photo;
  }
  if (body.bio !== undefined) p.bio = String(body.bio).slice(0, 600);
  if (body.history !== undefined) p.history = String(body.history).slice(0, 800);
  if (body.favoriteReads !== undefined) p.favoriteReads = String(body.favoriteReads).slice(0, 300);
  if (body.interests !== undefined) {
    if (!Array.isArray(body.interests)) throw new AppError('Book interests must be a list', 400);
    p.interests = [...new Set(body.interests.map(String).filter((g) => GENRES.includes(g)))];
  }
  me.profile = p;
  await me.save({ validateBeforeSave: true });
  return { name: me.name, ...formatProfile(me) };
};

module.exports = { listLeaders, getLeader, getMyProfile, updateMyProfile };
