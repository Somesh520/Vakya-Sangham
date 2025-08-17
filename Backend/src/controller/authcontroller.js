
import jwt from 'jsonwebtoken';
import User from '../models/usermodel.js';
import { generatetoken } from '../utils/generatetoken.js';
import { sendMail } from '../utils/sendEmail.js';
import bcrypt from 'bcrypt';
import redisClient from '../config/redisClient.js';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
// ✅ Signup Controller
export const signup = async (req, res) => {
 const { fullname, email, password, phone, referralCode } = req.body;


  try {
    if (!fullname || !email || !password || !phone ) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_]).{8,}$/;
if (!passwordRegex.test(password)) {
  return res.status(400).json({
    message: "Password must include uppercase, lowercase, number & special character.",
  });
}


    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP

    const newUser = new User({
      fullname: fullname,
      email,
      password: hashedPassword,
      phoneNumber: phone,
  referralCode: referralCode || null,
      isVerified: false,
    });

    await newUser.save();
    await redisClient.setEx(`otp:${email}`, 600, otp); // 10 minutes

   await sendMail({
  to: email,
  subject: "🔐 Email Verification - Vakya Sangham",
  html: `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333;">
      <h2>🔐 Verify Your Email - Vakya Sangham</h2>

      <p>Hello,</p>

      <p>Thank you for signing up with <strong>Vakya Sangham</strong>. To complete your registration, please use the OTP below:</p>

      <p style="font-size: 20px; font-weight: bold; color: #4CAF50; margin: 20px 0;">
        ${otp}
      </p>

      <p>This OTP is valid for <strong>10 minutes</strong>. Please do not share it with anyone.</p>

      <br/>
      <p>If you didn’t try to sign up, please ignore this email.</p>

      <br/>
      <p>Warm regards,</p>
      <p><strong>Team Vakya Sangham</strong></p>

      <hr style="margin-top: 30px;" />
      <small style="color: #888;">Helping India connect through language. Securely and simply.</small>
    </div>
  `
});


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
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      console.log('❌ User not found for email:', normalizedEmail);
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User is already verified.' });
    }

    const storedOtp = await redisClient.get(`otp:${normalizedEmail}`);

    console.log('📩 Stored OTP:', storedOtp, typeof storedOtp);
    console.log('📥 Entered OTP:', otp, typeof otp);

    if (!storedOtp || storedOtp !== otp.toString()) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    user.isVerified = true;
    await user.save();
    await redisClient.del(`otp:${normalizedEmail}`);

    // UPDATED: Assume generatetoken returns the token string
    const token = generatetoken(user._id, res); 

    // UPDATED: Send back a complete user object and the token in the body
    res.status(200).json({
      message: 'Email verified successfully.',
      user: {
        id: user._id, // It's good practice to send the ID
        name: user.fullName, // Make sure your user model has 'fullName'
        email: user.email,
        isOnboarded: user.isOnboarded, // 👈 CRITICAL: Added this field
      },
      token: token, // 👈 CRITICAL: Added the generated token
    });
  } catch (error) {
    console.error('❌ OTP Verification Error:', error.message);
    res.status(500).json({ message: 'OTP verification failed.' });
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

    // generatetoken(user._id, res);
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });
    res.status(200).json({
      message: "Login successful.",
       token: token,
      user: {
         fullname: user.fullname,
        email: user.email,
         role: user.role, 
        isOnboarded: user.isOnboarded,
         profileImageURL: user.profileImageURL
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

// ✅ Forgot Password Controller
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/user/auth/reset-password/${resetToken}`;

await sendMail({
  to: user.email,
  subject: "🔐 Reset Your Password - Vakya Sangham",
  html: `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333;">
      <h2>🔐 Vakya Sangham — Password Reset Request</h2>

      <p>Hello,</p>

      <p>We received a request to reset your password for your Vakya Sangham account. If you made this request, please click the button below to proceed:</p>

      <p style="margin: 20px 0;">
        <a href="${resetUrl}" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
      </p>

      <p>This link will be valid for <strong>15 minutes</strong>. If you didn’t request a password reset, you can safely ignore this email.</p>

      <br/>
      <p>Regards,</p>
      <p><strong>Team Vakya Sangham</strong></p>

      <hr style="margin-top: 30px;" />
      <small style="color: #888;">Ensuring language learning for every region with security & care.</small>
    </div>
  `
});

    // console.log("CLIENT_URL =>", process.env.CLIENT_URL);

    res.status(200).json({ message: "Reset link sent to email" });
  } catch (error) {
    console.error("❌ Forgot Password Error:", error.message);
    res.status(500).json({ message: "Failed to send reset email." });
  }
};

// ✅ Reset Password Controller
export const resetPassword = async (req, res) => {
  const token = req.params.token;
  const { password } = req.body;

  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("❌ Reset Password Error:", error.message);
    res.status(500).json({ message: "Reset failed." });
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
    await redisClient.setEx(`otp:${email}`, 600, otp);

    await sendMail({
  to: email,
  subject: "🔄 Your New OTP for Vakya Sangham Account Verification",
  html: `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333;">
      <h2>🔐 Vakya Sangham — Secure Your Account</h2>
      <p>Hi there,</p>

      <p>We’ve generated a new One-Time Password (OTP) for you, as requested. Please use the code below to complete your account verification process:</p>

      <h1 style="letter-spacing: 2px; font-size: 28px; color: #4CAF50;">${otp}</h1>

      <p>This OTP is valid for <strong>10 minutes</strong>. Please do not share this code with anyone for security reasons.</p>

      <p>If you didn’t request this, you can safely ignore this email.</p>

      <br/>
      <p>Warm regards,</p>
      <p><strong>Team Vakya Sangham</strong></p>
      <hr/>
      <small style="color: #888;">Empowering regional language learning for everyone.</small>
    </div>
  `
});


    res.status(200).json({ message: "OTP resent successfully." });
  } catch (error) {
    console.error("❌ Resend OTP Error:", error.message);
    res.status(500).json({ message: "Failed to resend OTP." });
  }
};


export const googleLogin = async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { sub: googleId, email, name: fullName } = ticket.getPayload();

    let user = await User.findOne({ googleId });

    if (!user) {
      user = await User.findOne({ email });
      if (user) {
        user.googleId = googleId;
      } else {
        user = new User({
          fullName,
          email,
          googleId,
          isVerified: true,
        });
      }
      await user.save();
    }

   
    generatetoken(user._id, res);

 res.status(200).json({
  message: "Google login successful.",
  user: {
    fullName: user.fullName,
    email: user.email,
    googleId: user.googleId,
    role: user.role || "student", // default role
  },
});

  } catch (error) {
    res.status(401).json({ message: "Invalid Google token." });
  }
};

