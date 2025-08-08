// routes/auth.js
const router = require('express').Router();
const passport = require('passport');

const [PRIMARY_CLIENT] = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const isProd = process.env.NODE_ENV === 'production';

// Инициируем Google OAuth
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
  prompt: 'select_account'
}));

// Callback от Google
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${PRIMARY_CLIENT}/login?error=oauth_failed`
  }),
  (req, res) => {
    // Успешный вход — редирект на фронт
    res.redirect(`${PRIMARY_CLIENT}/inventories`);
  }
);

// Текущий пользователь
router.get('/me', (req, res) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ ok: false, error: 'UNAUTHORIZED' });
  }
  const { id, name, email, avatar, isAdmin, lang, theme } = req.user;
  res.json({ ok: true, user: { id, name, email, avatar, isAdmin, lang, theme } });
});

// Выход
router.get('/logout', (req, res, next) => {
  // Удаляем серверную сессию
  req.logout(err => {
    if (err) return next(err);
    req.session?.destroy(() => {
      // Чистим куку (параметры должны совпадать с настройками в app.js)
      res.clearCookie('connect.sid', {
        path: '/',
        httpOnly: true,
        sameSite: isProd ? 'none' : 'lax',
        secure: isProd
      });
      res.json({ ok: true });
    });
  });
});

// Диагностика
router.get('/debug', (req, res) => {
  res.json({
    isAuthenticated: req.isAuthenticated ? req.isAuthenticated() : false,
    user: req.user || null,
    session: {
      id: req.sessionID,
      cookie: req.session?.cookie
    }
  });
});

module.exports = router;
