import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Google users ke liye optional
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
  // Onboarding Fields
  dateOfBirth: Date,
  education: {
    type: String,
    enum: ["Primary School", "High school", "College", "Master’s", "PhD"],
  },
  state: String,
  city: String,
  district: String,
  goal: {
    type: String,
    enum: ["Learn a new skill", "Advance my career", "Start a business", "Grow my business"],
  },
  contentPreference: {
    type: String,
    enum: ["Video courses", "PDFs", "Live mentorship"],
  },
  interest: String,
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
    default: false,
  },
  isOnboarded: { type: Boolean, default: false },
}, { timestamps: true });

// --- Virtual field for enrolled courses (from Enrollment collection) ---
userSchema.virtual('enrollments', {
  ref: 'Enrollment',
  localField: '_id',
  foreignField: 'student',
});
  enrolledCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
// --- Virtual field for profile progress (calculate dynamically) ---
userSchema.virtual('profileProgress').get(function () {
  // Example: calculate % based on enrollments completed
  if (!this.enrollments || this.enrollments.length === 0) return { completed: 0, total: 0, percentage: 0 };
  const completed = this.enrollments.filter(e => e.completed).length;
  const total = this.enrollments.length;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { completed, total, percentage };
});

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
