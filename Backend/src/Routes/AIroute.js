import express from "express";
import Ai from "../models/AImodel.js"; // 👈 AI model

const router = express.Router();

// GET: User ka current progress fetch karo
router.get("/:userId", async (req, res) => {
  try {
    const progress = await Ai.findOne({ userId: req.params.userId });
    if (!progress) {
      return res.json({ success: true, data: null }); // New user
    }
    res.json({ success: true, data: progress });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST: Naya course start karo
router.post("/start", async (req, res) => {
  try {
    const { userId, language } = req.body;
    // Find and update, or create if it doesn't exist (upsert)
    const progress = await UserProgress.findOneAndUpdate(
      { userId },
      { currentLanguage: language, currentLessonNumber: 1 },
      { new: true, upsert: true }
    );
    res.status(201).json({ success: true, data: progress });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT: Ek lesson complete karo aur aage badho
router.put("/complete-lesson", async (req, res) => {
  try {
    const { userId } = req.body;
    const updatedProgress = await UserProgress.findOneAndUpdate(
      { userId },
      { $inc: { currentLessonNumber: 1 } }, // Increment lesson number by 1
      { new: true }
    );
    res.json({ success: true, data: updatedProgress });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;