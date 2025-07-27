import express from 'express';
import {
    signup,
    login,
    logout,
    verifyOTP,
    resendOTP,
    forgotPassword,
    resetPassword,
    googleLogin 
} from '../controller/authcontroller.js';

const router = express.Router();

// --- Manual Authentication Routes ---
router.post('/signup', signup);
router.post('/verify-otp', verifyOTP);
router.post('/login', login);
router.get('/logout', logout);
router.post('/resend-otp', resendOTP);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// --- Google Authentication Route ---

router.post('/google', googleLogin);

export default router;