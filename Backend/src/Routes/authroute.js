import express from 'express';
import {
    signup,
    login,
    logout,
    verifyOTP,
    resendOTP,
    forgotPassword,
    resetPassword,
    googleLogin ,
    changePassword
} from '../controller/authcontroller.js';
import {verifyUser} from '../middleware/protect.js';
const router = express.Router();

// --- Manual Authentication Routes ---
router.post('/signup', signup);
router.post('/verify-otp', verifyOTP);
router.post('/login', login);
router.get('/logout', logout);
router.post('/resend-otp', resendOTP);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post('/changepassword', verifyUser ,changePassword);
// --- Google Authentication Route ---

router.post('/google', googleLogin);

export default router;