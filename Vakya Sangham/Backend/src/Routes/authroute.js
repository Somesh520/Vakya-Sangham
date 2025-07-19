import express from 'express';
import passport from "passport";
import {
  signup,
  login,
  logout,
  verifyOTP,
  resendOTP,forgotPassword, resetPassword
} from '../controller/authcontroller.js';
import { generatetoken } from '../utils/generatetoken.js';

const router = express.Router();

// 🔐 Manual Auth Routes
router.post('/signup', signup);
router.post('/verify-otp', verifyOTP);
router.post('/login', login); 
router.post('/logout', logout);
router.post('/resend-otp', resendOTP);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
// 🔗 Google Auth Routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// ✅ Google OAuth Callback Route
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/auth.html", 
    session: false,
  }),
  async (req, res) => {
    try {
     
      const token = generatetoken(req.user._id, res);

      
      res.status(200).json({
        message: "Google login successful",
        token,
        user: {
          id: req.user._id,
          fullName: req.user.fullName,
          email: req.user.email,
        },
      });
  
     
    } catch (err) {
      console.error("JWT Generation Error:", err.message);
      res.status(500).json({ message: "Login failed" });
    }
  }
);


export default router;
