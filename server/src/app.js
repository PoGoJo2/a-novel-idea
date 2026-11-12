// Builds the Express app (kept separate from server.js so tests can import it).
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
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

// These two must come last
app.use(notFound);
app.use(errorHandler);

module.exports = app;
