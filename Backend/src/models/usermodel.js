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
  phoneNumber: String,
  referralCode: String,
  role: {
        type: String,
        enum: ['student', 'teacher', 'admin'],
        default: 'student',
    },
    
  googleId: { type: String, unique: true, sparse: true },

  isVerified: { type: Boolean, default: false },
  otp: String,
  otpExpiry: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
 teacherProfile: {
      qualifications: String, 
      subjects: [String],   
      experience: String,     
  },
  // ✅ Onboarding Fields
  dateOfBirth: Date,
  education: {
    type: String,
    enum: ["Primary School", "High school", "College", "Master’s", "PhD"],
  },
  state: String,
  city:String,
  District:String,
  goal: {
    type: String,
    enum: ["Learn a new skill", "Advance my career", "Start a business", "Grow my business"],
  },
  contentPreference: {
    type: String,
    enum: ["Video courses", "PDFs", "Live mentorship"],
  },
  interest:String,
  timeAvailability: {
    type: String,
    enum: ["<15 minutes", "15-30 minutes", "30-60 minutes", ">1 hour"],
  },
  level: {
    type: String,
    enum: ["Beginner", "Intermediate", "Advanced"],
  },
 
  bio: String,
  socialLinks: [String],
profileImageURL: String,


resumeURL: String,

  preferredLanguage: String,
  avatar: String,
  hasTakenOnlineCourses: {
    type: Boolean,
    default: false, // Default to false
},
  isOnboarded: { type: Boolean, default: false },

  profileProgress: {
    completed: { type: Number, default: 0 },
    total: { type: Number, default: 17 },
    percentage: { type: Number, default: 0 },
  },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
