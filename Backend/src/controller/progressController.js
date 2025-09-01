import UserProgress from '../models/UserProgressModel.js';

export const markLessonAsComplete = async (req, res) => {
    try {
        const { courseId, lessonId } = req.body;
        const userId = req.user.id;

        if (!courseId || !lessonId) {
            return res.status(400).json({ message: 'Course ID and Lesson ID are required.' });
        }

        await UserProgress.findOneAndUpdate(
            { user: userId, course: courseId },
            { $addToSet: { completedLessons: lessonId } },
            { upsert: true, new: true }
        );

        res.status(200).json({
            success: true,
            message: 'Lesson marked as complete.'
        });

    } catch (error) {
        console.error("🔥 Mark Lesson Complete Error:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};