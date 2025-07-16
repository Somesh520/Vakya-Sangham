import express from 'express';
import passport from 'passport';
import '../config/passport.js'; // ✅ import your passport strategy config
// or '../../config/passport.js' depending on your folder structure

const router = express.Router();

// 🔗 Start Google OAuth
router.get('/', passport.authenticate('google', { scope: ['profile', 'email'] }));

// 🔁 Callback
router.get(
  '/callback',
  passport.authenticate('google', {
    failureRedirect: '/auth.html',
    successRedirect: '/user/auth/google/success',
    session: true, // 🔥 REQUIRED if using serializeUser/deserializeUser
  })
);

// ✅ Success Route
router.get('/success', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  res.status(200).json({
    message: 'Google login successful',
    user: {
      id: req.user._id,
      fullName: req.user.fullName,
      email: req.user.email,
    },
  });
});

// 🚪 Logout
router.get('/logout', (req, res) => {
  req.logout(err => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ message: 'Logout error' });
    }
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.status(200).json({ message: 'Logged out' });
    });
  });
});

export default router;
