import mongoose from 'mongoose'

const user = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: {
    type: String,
    required: function () {
      return !this.googleId;
    },
  },
  phoneNumber: { type: String },
  referralCode: { type: String },
  googleId: { type: String, unique: true, sparse: true },
  isVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpiry: { type: Date },
  resetPasswordToken: String,
  resetPasswordExpire: Date,

  // ✅ Add these onboarding fields
  education: { type: String },
  goal: { type: String },
  timeAvailability: { type: String },
  contentPreference: { type: [String], default: [] },
  isOnboarded: { type: Boolean, default: false }

}, { timestamps: true });




const User=mongoose.model('user',user);
export default User;