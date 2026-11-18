// Makes a person the administrator, and can change their display name.
// Run it from the server folder, for example to rename the seeded admin to Jordan:
//   node src/seed/setAdmin.js admin@example.com Jordan
// Or to promote someone who already registered (keeps their name):
//   node src/seed/setAdmin.js jordan@example.com
require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = require('../config/db');
const User = require('../models/User');

const [email, ...nameParts] = process.argv.slice(2);
const newName = nameParts.join(' ').trim();

const run = async () => {
  if (!email) {
    console.error('Please give the email of the account, for example:  node src/seed/setAdmin.js admin@example.com Jordan');
    process.exit(1);
  }
  await connectDB();
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    console.error(`No account found with the email ${email}.`);
    await mongoose.disconnect();
    process.exit(1);
  }
  user.role = 'admin';
  if (newName) user.name = newName;
  await user.save({ validateBeforeSave: false });
  console.log(`Done. ${user.name} (${user.email}) is now an administrator.`);
  await mongoose.disconnect();
};

run().catch(async (err) => {
  console.error('Failed:', err.message);
  await mongoose.disconnect();
  process.exit(1);
});
