import User from '../models/usermodel.js'; // Apne user model ka path check kar lein

export const isEnrolled = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { courseId } = req.params;

        // User ko database se find karein
        const user = await User.findById(userId);

        // Check karein ki user ke 'enrolledCourses' array mein courseId hai ya nahi
        const isCourseEnrolled = user.enrolledCourses.includes(courseId);

        // Agar user enrolled nahi hai AUR woh admin nahi hai, to error bhej dein
        if (!isCourseEnrolled && req.user.role !== 'admin') {
            return res.status(403).json({ 
                success: false, 
                message: "You are not enrolled in this course. Please purchase it to view content." 
            });
        }

        // Agar user enrolled hai ya admin hai, to use aage badhne dein
        next();

    } catch (error) {
        console.error("🔥 Enrollment Check Error:", error);
        res.status(500).json({ success: false, message: "Server error during enrollment check." });
    }
};