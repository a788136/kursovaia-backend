const router = require('express').Router();
const passport = require('passport');

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('http://localhost:5173/inventories'); 
    // или https://твой-фронтенд-домен/inventories если деплой
  }
);

// Проверка текущего пользователя
router.get('/me', (req, res) => {
  if (req.isAuthenticated()) {
    const { id, name, email, avatar, isAdmin, lang, theme } = req.user;
    res.json({ id, name, email, avatar, isAdmin, lang, theme });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

router.get('/logout', (req, res) => {
  req.logout(() => {
    res.send({ ok: true });
  });
});

module.exports = router;
