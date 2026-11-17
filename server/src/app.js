// Builds the Express app (kept separate from server.js so tests can import it).
const express = require('express');
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
const libraryRoutes = require('./routes/libraryRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

// Health check: proves the server is up (also handy after deployment)
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'A Novel Idea API is running' });
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

// These two must come last
app.use(notFound);
app.use(errorHandler);

module.exports = app;
