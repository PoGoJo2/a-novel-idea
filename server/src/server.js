// Entry point: loads env vars, connects to MongoDB, then starts the HTTP server.
require('dotenv').config(); // must run before anything reads process.env

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

if (!process.env.JWT_SECRET || !process.env.MONGODB_URI) {
  console.error('Missing JWT_SECRET or MONGODB_URI. Copy .env.example to .env and fill it in.');
  process.exit(1);
}

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
