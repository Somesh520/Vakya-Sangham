import User from '../models/usermodel.js';
import Enrollment from '../models/enrollmentModel.js';
import Course from '../models/courseModel.js';

export const getMyLearning = async (req, res) => {
  try {
    const userId = req.user.id;

    // Enrollment se courses fetch karo
    const enrollments = await Enrollment.find({ student: userId })
      .populate({
        path: 'course',
        populate: { path: 'instructor', select: 'fullname' }
      });

    const courses = enrollments.map(e => e.course);

    res.status(200).json({ success: true, courses });
  } catch (error) {
    console.error("Get My Learning Error:", error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
export const getLessonsForCourse = async (req, res) => {
    const { courseId } = req.params;
    const userId = req.user.id;

    try {
        // 1. Course ke saare lessons nikalo
        const allLessons = await Lesson.find({ course: courseId }).sort({ lessonNumber: 1 });
        
        // 2. User ki progress nikalo
        const progress = await UserProgress.findOne({ user: userId, course: courseId });
        const completed = progress ? progress.completedLessons.map(id => id.toString()) : [];

        // 3. Har lesson me 'isUnlocked' property add karo
        const lessonsWithStatus = allLessons.map((lesson, index) => {
            let isUnlocked = false;
            if (index === 0) {
                isUnlocked = true; // Pehla lesson hamesha unlocked hota hai
            } else {
                const previousLessonId = allLessons[index - 1]._id.toString();
                if (completed.includes(previousLessonId)) {
                    isUnlocked = true; // Agar pichla lesson complete hai, to isse unlock karo
                }
            }
            return { ...lesson.toObject(), isUnlocked };
        });

        res.status(200).json(lessonsWithStatus);

    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};