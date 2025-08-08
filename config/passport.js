// config/passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).lean();
    done(null, user || null);
  } catch (err) {
    console.error('[passport][deserializeUser] error:', err);
    done(err, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL, // ДОЛЖЕН ровно совпадать в Google Console
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email =
          Array.isArray(profile.emails) && profile.emails[0]?.value
            ? profile.emails[0].value.toLowerCase()
            : null;

        const name =
          profile.displayName ||
          [profile.name?.givenName, profile.name?.familyName].filter(Boolean).join(' ') ||
          'Без имени';

        const avatar =
          Array.isArray(profile.photos) && profile.photos[0]?.value ? profile.photos[0].value : null;

        if (!email) {
          console.error('[passport][google] no email in profile:', {
            providerId: profile.id,
          });
          return done(new Error('NO_EMAIL_FROM_GOOGLE'), null);
        }

        const now = new Date();
        const updates = { name, avatar, provider: 'google', lastLoginAt: now };

        // Безопасный upsert — не падаем на E11000 duplicate key
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
        ).lean();

        return done(null, user);
      } catch (err) {
        console.error('[passport][google] error:', err);
        return done(err, null);
      }
    }
  )
);

module.exports = passport;
