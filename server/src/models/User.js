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
    themePreference: { type: String, enum: ['light', 'dark'], default: 'light' },
    // The reader's own lists: hearted books and books saved for next time (Book ids)
    favoriteBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
    savedBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
    // Books the reader wants to hear about when a new group starts (the group they wanted has already begun)
    notifyBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
  },
  { timestamps: true }
);

// Hash the password whenever it is new or changed
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
