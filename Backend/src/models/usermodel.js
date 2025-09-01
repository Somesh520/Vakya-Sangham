import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // optional for Google users
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

  // --- Onboarding Fields ---
  dateOfBirth: Date,
  education: {
    type: String,
    enum: ["Primary School", "High school", "College", "Master’s", "PhD"],
     default: null,
  },
  state: String,
  district: String,
  goal: {
    type: String,
    enum: ["Learn a new skill", "Advance my career", "Start a business", "Grow my business"],
     default: null,
  },
  contentPreference: {
    type: String,
    enum: ["Video courses", "PDFs", "Live mentorship"],
     default: null,
  },
  interest: String,
  timeAvailability: {
    type: String,
    enum: ["<15 minutes", "15-30 minutes", "30-60 minutes", ">1 hour"],
     default: null,
  },
  level: {
    type: String,
    enum: ["Beginner", "Intermediate", "Advanced"],
     default: null,
  },
  bio: String,
  socialLinks: [String],
  profileImageURL: String,
  resumeURL: String,
  preferredLanguage: String,
  hasTakenOnlineCourses: { type: Boolean, default: false },

  enrolledCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],

  isOnboarded: { type: Boolean, default: false },

  // --- Store onboarding progress directly in DB ---
  profileProgress: {
    completed: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
  }

}, { timestamps: true });

// --- Virtual for enrolled courses (optional) ---
userSchema.virtual('enrollments', {
  ref: 'Enrollment',
  localField: '_id',
  foreignField: 'student',
});

// --- Ensure virtuals appear in JSON ---
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

// --- Method to calculate onboarding progress dynamically ---
userSchema.methods.calculateOnboardingProgress = function() {
  const fields = [
    "dateOfBirth", "education", "state", "district", "goal", "contentPreference",
    "timeAvailability", "level", "bio", "socialLinks",
    "profileImageURL", "resumeURL", "preferredLanguage",
    "interest", "hasTakenOnlineCourses"
  ];

  let completed = 0;
  fields.forEach(field => {
    const value = this[field];
    if (value !== undefined && value !== null && String(value).trim() !== "" && !(Array.isArray(value) && value.length === 0)) {
      completed++;
    }
  });

  const total = fields.length;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  // Update DB field
  this.profileProgress = { completed, total, percentage };
  if (percentage === 100) this.isOnboarded = true;

  return this.profileProgress;
};

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
