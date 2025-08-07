const { Schema, model } = require('mongoose');

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  name: String,
  provider: String,
  avatar: String,
  isAdmin: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false },
  lang: { type: String, default: 'en' },
  theme: { type: String, default: 'light' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = model('User', UserSchema);
