const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 60 },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    // select:false keeps the hash out of normal queries
    password: { type: String, required: [true, 'Password is required'], minlength: 8, select: false },
    role: { type: String, enum: ['member', 'leader', 'admin'], default: 'member' },
    // Meetings are stored in UTC and shown in each user's own time zone
    timezone: { type: String, default: 'America/New_York' },
    // An administrator can suspend a disruptive client: they can no longer use the site
    suspended: { type: Boolean, default: false },
    suspendedReason: { type: String, default: '', maxlength: 300 },
    themePreference: { type: String, enum: ['light', 'dark'], default: 'light' },
    // Passwords: when it last changed (older logins stop working), whether an administrator set a
    // temporary one that must be replaced, and when the person asked for a reset from the login page
    passwordChangedAt: { type: Date, default: null },
    mustChangePassword: { type: Boolean, default: false },
    passwordResetRequestedAt: { type: Date, default: null },
    // The reader's own lists: hearted books and books saved for next time (Book ids)
    favoriteBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
    savedBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
    // Books the reader wants to hear about when a new group starts (the group they wanted has already begun)
    notifyBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
    // Leader profile, shown on the public "Meet the Leaders" page
    profile: {
      photo: { type: String, default: '', maxlength: 400000 }, // a small picture: a web path or a resized data URL
      bio: { type: String, default: '', trim: true, maxlength: 600 },
      history: { type: String, default: '', trim: true, maxlength: 800 },
      interests: [{ type: String, trim: true, maxlength: 60 }], // favorite genres
      favoriteReads: { type: String, default: '', trim: true, maxlength: 300 },
    },
  },
  { timestamps: true }
);

// Hash the password whenever it is new or changed
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
  // A changed password signs out every older login (one second earlier so the new token still works)
  if (!this.isNew) this.passwordChangedAt = new Date(Date.now() - 1000);
});

userSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
