// Replaces the development password (password123) now that the site is public.
// Run it from the server folder:
//   node src/seed/resetPasswords.js                     -> only LISTS the accounts still using password123
//   node src/seed/resetPasswords.js 'NewPassword' admin    -> only the administrator(s)
//   node src/seed/resetPasswords.js 'NewPassword' leader   -> only the leaders
//   node src/seed/resetPasswords.js 'NewPassword' member   -> only the members
//   node src/seed/resetPasswords.js 'NewPassword'          -> every account still on password123
// Accounts that already have their own password are never touched.
require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = require('../config/db');
const User = require('../models/User');

const OLD_PASSWORD = 'password123';
const newPassword = process.argv[2];
const role = process.argv[3]; // optional: admin, leader or member

const run = async () => {
  if (newPassword !== undefined && (newPassword.length < 8 || newPassword === OLD_PASSWORD)) {
    console.error('The new password must be at least 8 characters and different from password123.');
    process.exit(1);
  }
  if (role !== undefined && !['admin', 'leader', 'member'].includes(role)) {
    console.error('The role must be admin, leader or member.');
    process.exit(1);
  }
  await connectDB();

  const users = await User.find(role ? { role } : {}).select('+password');
  const stillOld = [];
  for (const user of users) {
    if (await user.matchPassword(OLD_PASSWORD)) stillOld.push(user);
  }

  if (!stillOld.length) {
    console.log(`No ${role ? role + ' ' : ''}accounts use password123. Nothing to change.`);
  } else if (newPassword === undefined) {
    console.log(`${stillOld.length} ${role ? role + ' ' : ''}account(s) still use password123:`);
    stillOld.forEach((u) => console.log(`  ${u.email}  (${u.role})`));
    console.log("\nNothing was changed. To change them, run again with your new password in single quotes, and optionally a role (admin, leader or member).");
  } else {
    for (const user of stillOld) {
      user.password = newPassword; // the User model hashes it on save
      await user.save({ validateBeforeSave: false });
      console.log(`  changed: ${user.email}  (${user.role})`);
    }
    console.log(`\nDone. ${stillOld.length} account(s) now use your new password.`);
  }
  await mongoose.disconnect();
};

run().catch(async (err) => {
  console.error(err.message);
  await mongoose.disconnect();
  process.exit(1);
});
