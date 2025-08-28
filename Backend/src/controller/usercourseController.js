import User from '../models/usermodel.js';
import Enrollment from '../models/enrollmentModel.js';
import Course from '../models/courseModel.js';

// Don't forget to import your new model at the top of the file
import UserProgress from '../models/UserProgressModel.js'; 
// import Enrollment from '../models/Enrollment.js';

export const getMyLearning = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Get all courses the user is enrolled in
    const enrollments = await Enrollment.find({ student: userId })
      .populate({
        path: 'course',
        select: 'title thumbnailURL modules instructor',
        populate: { 
          path: 'instructor',
          select: 'fullname'
        }
      });

    // console.log('All Enrollments Data:', JSON.stringify(enrollments, null, 2));

    // 2. Map through each enrollment to calculate progress
    const coursesWithProgress = await Promise.all(
      enrollments.map(async (enrollment) => {
        if (!enrollment.course) return null;

        const course = enrollment.course;
        let progress = 0;

        // 3. Find the user's progress for this specific course
        const userProgress = await UserProgress.findOne({
          user: userId,
          course: course._id,
        });
        
        // 4. Calculate total number of lessons in the course
        const totalLessons = course.modules.reduce((acc, module) => acc + module.lessons.length, 0);

        // 5. If progress and lessons exist, calculate the percentage
        if (userProgress && totalLessons > 0) {
          const completedLessonsCount = userProgress.completedLessons.length;
          progress = Math.round((completedLessonsCount / totalLessons) * 100);
        }

        // ✅ Add instructor name in response
        return {
          _id: course._id,
          title: course.title,
          thumbnailURL: course.thumbnailURL,
          progress,
         instructor: course.instructor ? { fullname: course.instructor.fullname } : null
};
        
      })
    );
    
    // Filter out any null results
    const finalCourses = coursesWithProgress.filter(c => c !== null);

    res.status(200).json({ success: true, courses: finalCourses });

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