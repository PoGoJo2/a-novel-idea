// Builds the Express app (kept separate from server.js so tests can import it).
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const groupRoutes = require('./routes/groupRoutes');
const membershipRoutes = require('./routes/membershipRoutes');
const meRoutes = require('./routes/meRoutes');
const oneOnOneRoutes = require('./routes/oneOnOneRoutes');
const aiRoutes = require('./routes/aiRoutes');
const goalRoutes = require('./routes/goalRoutes');
const adminRoutes = require('./routes/adminRoutes');
const libraryRoutes = require('./routes/libraryRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const leaderRoutes = require('./routes/leaderRoutes');
const profileRoutes = require('./routes/profileRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json({ limit: '1mb' })); // room for a small profile photo
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

// Health check: proves the server is up (also handy after deployment)
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'A Novel Idea API is running' });
});

// Make sure the database is connected before any route runs.
// Locally, server.js connects at start-up. On Vercel only this app runs, so it connects on the first
// request and then reuses that connection. (Skipped in tests, which have no database.)
let connecting = null;
app.use(async (req, res, next) => {
  if (process.env.NODE_ENV === 'test' || mongoose.connection.readyState === 1) return next();
  try {
    connecting = connecting || mongoose.connect(process.env.MONGODB_URI);
    await connecting;
    return next();
  } catch (err) {
    connecting = null; // try again on the next request
    return next(err);
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/memberships', membershipRoutes);
app.use('/api/me', meRoutes);
app.use('/api/one-on-ones', oneOnOneRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api', goalRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/leader', leaderRoutes);
app.use('/api/leaders', profileRoutes); // public: Meet the Leaders

// These two must come last
app.use(notFound);
app.use(errorHandler);

module.exports = app;
