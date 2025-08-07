const router = require('express').Router();
const passport = require('passport');

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/'); // или на фронт
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
