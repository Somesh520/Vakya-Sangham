import express from 'express';
import passport from "passport";
import {
  signup,
  login,
  logout,
  verifyOTP,
  resendOTP
} from '../controller/authcontroller.js';
import { generatetoken } from '../utils/generatetoken.js';

const router = express.Router();

// 🔐 Manual Auth Routes
router.post('/signup', signup);
router.post('/verify-otp', verifyOTP);
router.post('/login', login); // ✅ lowercase
router.post('/logout', logout);
router.post('/resend-otp', resendOTP);

// 🔗 Google Auth Routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// ✅ Google OAuth Callback Route
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/auth.html", // or just "/login"
    session: false,
  }),
  async (req, res) => {
    try {
      // 🛡️ Generate JWT and set cookie
      const token = generatetoken(req.user._id, res);

      // ✅ Send token and user info as response
      res.status(200).json({
        message: "Google login successful",
        token,
        user: {
          id: req.user._id,
          fullName: req.user.fullName,
          email: req.user.email,
        },
      });
  
      // 🔁 Later, replace with: res.redirect("http://localhost:5500/dashboard.html");
    } catch (err) {
      console.error("JWT Generation Error:", err.message);
      res.status(500).json({ message: "Login failed" });
    }
  }
);


export default router;
