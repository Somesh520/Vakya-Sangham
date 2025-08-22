import Course from '../models/courseModel.js';
import Activity from '../models/activityModel.js';
import Review from '../models/Review.js';

// ========== POST: Create a new course ==========
export const createCourse = async (req, res) => {
    try {
        const { title, description, category, price, language, level } = req.body;
        const instructorId = req.user.id;

        if (!title || !description || !category || !language || !level) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required course details.'
            });
        }

        const newCourse = await Course.create({
            title,
            description,
            category,
            price,
            language,
            level,
            instructor: instructorId,
            isPublished: true
        });

        await Activity.create({
            type: 'course_creation',
            description: `Course "${newCourse.title}" was created by ${req.user.fullname}.`,
            user: req.user.id
        });

        res.status(201).json({
            success: true,
            message: "Course created successfully.",
            course: newCourse
        });
    } catch (error) {
        console.error("🔥 Create Course Error:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// ========== GET: Get all courses with filtering ==========
export const getAllCourses = async (req, res) => {
    try {
        const { q, language, level, category } = req.query;

        const query = {};
        if (req.user?.role !== 'admin') query.isPublished = true;

        if (q) query.title = { $regex: q, $options: 'i' };
        if (language) query.language = language;
        if (level) query.level = level;
        if (category) query.category = category;

        const courses = await Course.find(query).populate('instructor', 'fullname');
        res.status(200).json({ success: true, courses });
    } catch (error) {
        console.error("🔥 Get All Courses Error:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// ========== GET: Get featured courses ==========
export const getFeaturedCourses = async (req, res) => {
    try {
        const courses = await Course.find({ isPublished: true })
            .sort({ createdAt: -1 })
            .limit(4)
            .populate('instructor', 'fullname');
        res.status(200).json({ success: true, courses });
    } catch (error) {
        console.error("🔥 Get Featured Courses Error:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// ========== GET: Get a single course by ID ==========
export const getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('instructor', 'fullname profileImageURL')
            .populate({
                path: 'reviews',
                populate: { path: 'user', select: 'fullname profileImageURL' }
            });

        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found.' });
        }
        res.status(200).json({ success: true, course });
    } catch (error) {
        console.error("🔥 Get Course By ID Error:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// ========== PATCH: Update a course ==========
export const updateCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found.' });
        }
        if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized.' });
        }

        const updatedCourse = await Course.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: "Course updated successfully.",
            course: updatedCourse
        });
    } catch (error) {
        console.error("🔥 Update Course Error:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// ========== DELETE: Delete a course ==========
export const deleteCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found.' });
        }
        if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized.' });
        }

        const courseTitle = course.title;
        await course.deleteOne();

        await Activity.create({
            type: 'course_deletion',
            description: `Course "${courseTitle}" was deleted by ${req.user.fullname}.`,
            user: req.user.id
        });

        res.status(200).json({ success: true, message: 'Course deleted successfully.' });
    } catch (error) {
        console.error("🔥 Delete Course Error:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// ========== POST: Create a review ==========
export const createCourseReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found.' });
        }

        // ✅ Check if already reviewed
        const alreadyReviewed = await Review.findOne({ user: req.user.id, course: req.params.id });
        if (alreadyReviewed) {
            return res.status(400).json({ success: false, message: 'You already reviewed this course.' });
        }

        const review = await Review.create({
            user: req.user.id,
            course: req.params.id,
            rating,
            comment,
        });

        course.reviews.push(review._id);
        await course.save();

        res.status(201).json({ success: true, message: 'Review added successfully.', review });
    } catch (error) {
        console.error("🔥 Create Review Error:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// controller/coursecontroller.js

// ... (aapke purane functions waise hi rahenge)

// ========== POST: Ek course mein naya module add karein ==========
export const addModuleToCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { title } = req.body;

        if (!title) {
            return res.status(400).json({ success: false, message: 'Module title is required.' });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found.' });
        }

        // Check karein ki user is course ka instructor hai ya admin
        if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized.' });
        }

        course.modules.push({ title, lessons: [] });
        await course.save();

        res.status(201).json({ success: true, message: 'Module added successfully.', course });

    } catch (error) {
        console.error("🔥 Add Module Error:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// ========== POST: Ek module mein naya lesson add karein ==========
export const addLessonToModule = async (req, res) => {
    try {
        const { courseId, moduleId } = req.params;
        const { title, videoURL, duration } = req.body;

        if (!title || !videoURL || !duration) {
            return res.status(400).json({ success: false, message: 'Lesson title, videoURL, and duration are required.' });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found.' });
        }

        // Check karein ki user is course ka instructor hai ya admin
        if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized.' });
        }

        const module = course.modules.id(moduleId);
        if (!module) {
            return res.status(404).json({ success: false, message: 'Module not found.' });
        }

        module.lessons.push({ title, videoURL, duration });
        await course.save();

        res.status(201).json({ success: true, message: 'Lesson added successfully.', course });

    } catch (error) {
        console.error("🔥 Add Lesson Error:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};
