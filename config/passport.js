// config/passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
  // Берём _id (на всякий случай приводим к строке)
  const id = user?._id?.toString?.() || user?.id;
  if (!id) return done(new Error('NO_USER_ID_TO_SERIALIZE'));
  done(null, id);
});

passport.deserializeUser(async (id, done) => {
  try {
    // Тут можно lean, это уже чтение по id
    const user = await User.findById(id).lean();
    done(null, user || null);
  } catch (err) {
    console.error('[passport][deserializeUser] error:', err);
    done(err, null);
  }
});

passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = Array.isArray(profile.emails) && profile.emails[0]?.value
        ? profile.emails[0].value.toLowerCase()
        : null;

      if (!email) return done(new Error('NO_EMAIL_FROM_GOOGLE'), null);

      const name =
        profile.displayName ||
        [profile.name?.givenName, profile.name?.familyName].filter(Boolean).join(' ') ||
        'Без имени';

      const avatar =
        (Array.isArray(profile.photos) && profile.photos[0]?.value) ? profile.photos[0].value : null;

      const now = new Date();
      const updates = { name, avatar, provider: 'google', lastLoginAt: now };

      // ВАЖНО: без .lean(), чтобы вернуть mongoose-документ с virtual id
      const user = await User.findOneAndUpdate(
        { email },
        {
          $set: updates,
          $setOnInsert: {
            email,
            createdAt: now,
            isAdmin: false,
            lang: 'en',
            theme: 'light',
          },
        },
        { new: true, upsert: true }
      );

      return done(null, user);
    } catch (err) {
      console.error('[passport][google] error:', err);
      return done(err, null);
    }
  }
));

module.exports = passport;
