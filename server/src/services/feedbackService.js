const Feedback = require('../models/Feedback');
const AppError = require('../utils/AppError');

const KINDS = ['complaint', 'review', 'other'];

// A signed-in member sends a complaint or review
const submit = async (user, { kind, message, rating, bookId, groupId }) => {
  if (!KINDS.includes(kind)) throw new AppError(`Kind must be one of: ${KINDS.join(', ')}`, 400);
  if (!message || !String(message).trim()) throw new AppError('Please write a message', 400);
  const stars = rating === undefined || rating === null || rating === '' ? undefined : Number(rating);
  if (stars !== undefined && !(Number.isInteger(stars) && stars >= 1 && stars <= 5)) throw new AppError('Rating must be 1 to 5 stars', 400);

  const item = await Feedback.create({ user: user._id, kind, message: String(message).trim(), rating: stars, book: bookId || undefined, group: groupId || undefined });
  return { id: item._id };
};

module.exports = { submit, KINDS };
