// Fixes classes that break the leader scheduling rules: no two meetings that overlap in time,
// and at most 3 class meetings a day. Classes created before the rules existed may break them.
// Run from the server folder:
//   node src/seed/fixLeaderConflicts.js            (shows what it WOULD change, changes nothing)
//   node src/seed/fixLeaderConflicts.js --apply    (makes the changes)
// For each class that breaks a rule it tries, in order:
//   1) give it to another leader who is free at those times (one-on-one times move with it)
//   2) if it has not started and nobody has joined: give it new meeting days and times that a leader is free for
//   3) if it has not started and nobody has joined: take its leader off, so it shows
//      "Coming soon · Finding a leader" and leaders can pick it up under Leader tools > Volunteer to lead
// Classes that have started (or that members already joined) are only listed, so the administrator can decide.
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const ReadingGroup = require('../models/ReadingGroup');
const Membership = require('../models/Membership');
const OneOnOneSlot = require('../models/OneOnOneSlot');
const { scheduleProblem } = require('../services/leaderService');
const { syncMeetings } = require('../services/adminService');

const APPLY = process.argv.includes('--apply');
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const TIMES = ['10:00', '13:00', '16:00', '18:00', '19:30']; // meeting times the script may choose from

// Every pair of meeting days at least two days apart, at any of the allowed times
const pairsFor = (count) => {
  const out = [];
  for (let a = 0; a < 7; a += 1) {
    if (count === 1) { TIMES.forEach((t) => out.push([[a, t]])); continue; }
    for (let b = a + 2; b < 7; b += 1) TIMES.forEach((t1) => TIMES.forEach((t2) => out.push([[a, t1], [b, t2]])));
  }
  return out;
};
const timesText = (slots) => slots.map((s) => `${DAYS[s.dayOfWeek]} ${s.startTime}`).join(', ');

const run = async () => {
  await connectDB();
  const leaders = await User.find({ role: 'leader', suspended: { $ne: true } }).select('name').sort({ name: 1 });
  const groups = await ReadingGroup.find({ status: { $ne: 'finished' }, leader: { $ne: null } }).populate('book', 'title');
  const joined = new Set((await Membership.distinct('group', { status: 'active' })).map(String));
  // Classes that cannot change times go first (started or already joined), then by start date
  const fixed = (g) => g.currentWeek > 0 || joined.has(String(g._id));
  groups.sort((a, b) => fixed(b) - fixed(a) || new Date(a.startDate) - new Date(b.startDate));

  const load = new Map(leaders.map((l) => [String(l._id), []]));
  const nameOf = new Map(leaders.map((l) => [String(l._id), l.name]));
  const byLoad = () => [...leaders].sort((a, b) => load.get(String(a._id)).length - load.get(String(b._id)).length);
  const changes = [];
  const stuck = [];

  for (const g of groups) {
    const owner = String(g.leader);
    const title = g.book?.title || 'A class';
    if (!load.has(owner)) continue; // led by an administrator: left as it is
    if (!scheduleProblem(g, load.get(owner), 'x')) { load.get(owner).push(g); continue; }

    // 1) another leader who is free at the same times
    const free = byLoad().find((l) => !scheduleProblem(g, load.get(String(l._id)), 'x'));
    if (free) {
      changes.push({ g, kind: 'leader', from: owner, text: `${title}: now led by ${free.name} (was ${nameOf.get(owner)})` });
      g.leader = free._id;
      load.get(String(free._id)).push(g);
      continue;
    }
    if (fixed(g)) {
      stuck.push(`${title} (led by ${nameOf.get(owner)}; ${g.currentWeek > 0 ? 'already started' : 'members have joined'})`);
      load.get(owner).push(g);
      continue;
    }

    // 2) new meeting days and times that some leader is free for
    let placed = false;
    for (const l of byLoad()) {
      for (const pair of pairsFor(g.timeSlots.length)) {
        const slots = g.timeSlots.map((s, i) => ({ ...s.toObject(), dayOfWeek: pair[i][0], startTime: pair[i][1] }));
        const trial = { ...g.toObject(), _id: g._id, book: g.book, timeSlots: slots };
        if (!scheduleProblem(trial, load.get(String(l._id)), 'x')) {
          changes.push({ g, kind: 'times', from: owner, slots, text: `${title}: meets ${timesText(slots)} (was ${timesText(g.timeSlots)}), led by ${l.name}` });
          g.leader = l._id;
          g.timeSlots = slots;
          load.get(String(l._id)).push(g);
          placed = true;
          break;
        }
      }
      if (placed) break;
    }
    if (placed) continue;

    // 3) no leader is free: it waits for a volunteer
    changes.push({ g, kind: 'unassign', from: owner, text: `${title}: Coming soon · Finding a leader (was ${nameOf.get(owner)})` });
    g.leader = null;
  }

  const count = (kind) => changes.filter((c) => c.kind === kind).length;
  console.log(`${changes.length} class(es) to change: ${count('leader')} to another leader, ${count('times')} new meeting times, ${count('unassign')} finding a leader.`);
  changes.forEach((c) => console.log('  - ' + c.text));
  if (stuck.length) {
    console.log(`\n${stuck.length} class(es) the script will not change. Fix them on the Administrator page (Groups tab):`);
    stuck.forEach((s) => console.log('  - ' + s));
  }

  if (!APPLY) {
    console.log('\nNothing was changed. Run again with --apply to make these changes.');
  } else {
    for (const c of changes) {
      const g = c.g;
      const update = { leader: g.leader };
      if (c.kind === 'times') update.timeSlots = c.slots;
      await ReadingGroup.updateOne({ _id: g._id }, update);
      if (g.leader) await OneOnOneSlot.updateMany({ group: g._id, leader: c.from }, { leader: g.leader });
      else await OneOnOneSlot.deleteMany({ group: g._id, bookedBy: null }); // unbooked one-on-one times of the old leader
      if (c.kind === 'times') await syncMeetings(await ReadingGroup.findById(g._id)); // move the weekly meetings to the new times
    }
    console.log('\nDone. All changes were saved.');
  }
  await mongoose.disconnect();
};

run().catch(async (err) => {
  console.error('Failed:', err.message);
  await mongoose.disconnect();
  process.exit(1);
});
