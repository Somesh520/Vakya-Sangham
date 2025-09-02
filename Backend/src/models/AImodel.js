import mongoose from "mongoose";

const UserProgressSchema = new mongoose.Schema({
  userId: {
    type: String, // Keep it simple with a string ID from your app
    required: true,
    unique: true, // Crucial: Ensures one record per user
  },
  currentLanguage: {
    type: String,
    required: true,
  },
  currentLessonNumber: {
    type: Number,
    required: true,
    default: 1, // Always start at lesson 1
  },
}, { timestamps: true }); // Automatically adds 'createdAt' and 'updatedAt'

const Ai = mongoose.model("Ai", UserProgressSchema);

export default Ai;