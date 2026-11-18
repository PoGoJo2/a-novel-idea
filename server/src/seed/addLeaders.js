// Sets up the test leaders. Run it once from the server folder:   node src/seed/addLeaders.js
//   - Lena Leader becomes "Lovie" (she keeps every class she already leads)
//   - Nicole and Jaxon are new leaders with no classes yet, so they can try "Volunteer to lead"
// Safe to run again. Development passwords only: replace them before the site goes live.
require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = require('../config/db');
const User = require('../models/User');

const PASSWORD = 'password123'; // development only

const run = async () => {
  await connectDB();

  // Lena -> Lovie (same account, same classes)
  let lovie = await User.findOne({ email: 'lovie@example.com' });
  const lena = await User.findOne({ email: 'leader@example.com' });
  if (!lovie && lena) {
    lena.name = 'Lovie';
    lena.email = 'lovie@example.com';
    await lena.save({ validateBeforeSave: false });
    lovie = lena;
    console.log('Lena Leader is now Lovie (lovie@example.com).');
  } else if (!lovie) {
    lovie = await User.create({ name: 'Lovie', email: 'lovie@example.com', password: PASSWORD, role: 'leader' });
    console.log('Created Lovie (lovie@example.com).');
  } else {
    console.log('Lovie already exists.');
  }

  for (const [name, email] of [['Nicole', 'nicole.leader@example.com'], ['Jaxon', 'jaxon@example.com']]) {
    const found = await User.findOne({ email });
    if (found) {
      if (found.role === 'member') { found.role = 'leader'; await found.save({ validateBeforeSave: false }); }
      console.log(`${name} already exists (${email}).`);
    } else {
      await User.create({ name, email, password: PASSWORD, role: 'leader' });
      console.log(`Created ${name} (${email}).`);
    }
  }

  console.log(`\nLeader logins (development only), password for all: ${PASSWORD}`);
  console.log('  lovie@example.com');
  console.log('  nicole.leader@example.com');
  console.log('  jaxon@example.com');
  await mongoose.disconnect();
};

run().catch(async (err) => {
  console.error('Failed:', err.message);
  await mongoose.disconnect();
  process.exit(1);
});
