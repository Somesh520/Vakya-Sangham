import User from '../models/usermodel.js';
import { generatetoken } from '../utils/generatetoken.js';
import { sendVerificationEmail } from '../utils/sendEmail.js';
import bcrypt from 'bcrypt';
import redisClient from '../config/redisClient.js';

// ✅ Signup Controller
export const signup = async (req, res) => {
  const { fullname, email, password, phoneNumber, referralCode } = req.body;

  try {
    if (!fullname || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP

    const newUser = new User({
      fullName: fullname,
      email,
      password: hashedPassword,
      phoneNumber,
      referralCode,
      isVerified: false
    });

    await newUser.save();

    await redisClient.setEx(`otp:${email}`, 600, otp); // TTL: 10 minutes
    await sendVerificationEmail(email, otp);

    res.status(200).json({
      message: "Signup successful. Please verify your email with the OTP sent to your email.",
    });

  } catch (error) {
    console.error("❌ Signup Error:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



// ✅ Verify OTP Controller
export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found." });
    if (user.isVerified) return res.status(400).json({ message: "User is already verified." });

    const storedOtp = await redisClient.get(`otp:${email}`);
    if (!storedOtp || storedOtp !== otp) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    user.isVerified = true;
    await user.save();
    await redisClient.del(`otp:${email}`); // clear OTP from Redis

    generatetoken(user._id, res); // Set JWT cookie

    res.status(200).json({
      message: "Email verified successfully.",
      user: {
        fullName: user.fullName,
        email: user.email,
      },
    });

  } catch (error) {
    console.error("❌ OTP Verification Error:", error.message);
    res.status(500).json({ message: "OTP verification failed." });
  }
};



// ✅ Login Controller
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect password." });

    if (!user.isVerified) {
      return res.status(403).json({ message: "Please verify your email before login." });
    }

    generatetoken(user._id, res); // Set JWT cookie

    res.status(200).json({
      message: "Login successful.",
      user: {
        fullName: user.fullName,
        email: user.email,
      },
    });

  } catch (error) {
    console.error("❌ Login Error:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



// ✅ Logout Controller
export const logout = (req, res) => {
  try {
    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "Lax",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({ message: "Logged out successfully." });
  } catch (error) {
    console.error("❌ Logout Error:", error.message);
    res.status(500).json({ message: "Logout failed." });
  }
};



// ✅ Resend OTP Controller
export const resendOTP = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found." });
    if (user.isVerified) return res.status(400).json({ message: "User already verified." });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await redisClient.setEx(`otp:${email}`, 600, otp); // 10 minutes
    await sendVerificationEmail(email, otp);

    res.status(200).json({ message: "OTP resent successfully." });
  } catch (error) {
    console.error("❌ Resend OTP Error:", error.message);
    res.status(500).json({ message: "Failed to resend OTP." });
  }
};
