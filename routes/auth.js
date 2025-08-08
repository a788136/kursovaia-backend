// routes/auth.js
const router = require('express').Router();
const passport = require('passport');

// Google OAuth — инициируем авторизацию
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
  prompt: 'select_account'
}));

// Callback от Google
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // После успешного входа — редиректим на фронт
    res.redirect(`${process.env.CLIENT_URL.split(',')[0]}/inventories`);
  }
);

// Проверка текущего пользователя
router.get('/me', (req, res) => {
  if (req.isAuthenticated()) {
    const { id, name, email, avatar, isAdmin, lang, theme } = req.user;
    return res.json({ id, name, email, avatar, isAdmin, lang, theme });
  }
  res.status(401).json({ error: 'Not authenticated' });
});

// Выход
router.get('/logout', (req, res) => {
  req.logout(() => {
    res.clearCookie('connect.sid', { path: '/' }); // Чистим куку сессии
    res.send({ ok: true });
  });
});

module.exports = router;
