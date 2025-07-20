import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
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

  // ✅ Onboarding Details
  dateOfBirth: { type: Date },
  education: {
    type: String,
    enum: ["Primary School", "High school", "College", "Master’s", "PhD"],
  },
  state: { type: String, default: "" },
  goal: {
    type: String,
    enum: ["Learn a new skill", "Advance my career", "Start a business", "Grow my business"],
  },
  contentPreference: {
    type: String,
    enum: ["Video courses", "PDFs", "Live mentorship"],
  },
  streak: { type: Number, default: 0 },
  timeAvailability: {
    type: String,
    enum: ["<15 minutes", "15-30 minutes", "30-60 minutes", ">1 hour"],
  },
  level: {
    type: String,
    enum: ["Beginner", "Intermediate", "Advanced"],
  },
  profilePicture: String,
  bio: String,
  socialLinks: [String],
  resume: String,
  preferredLanguage: String,
  avatar: String,
  isOnboarded: { type: Boolean, default: false },


  profileProgress: {
    completed: { type: Number, default: 0 },
    total: { type: Number, default: 14 },
    percentage: { type: Number, default: 0 }
  }

}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
