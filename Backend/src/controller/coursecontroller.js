import Course from '../models/courseModel.js';
import Activity from '../models/activityModel.js';
import Review from '../models/Review.js'; // ✅ रिव्यू के लिए मॉडल इम्पोर्ट करें

// ========== POST: Create a new course ==========
// ========== POST: Create a new course ==========
export const createCourse = async (req, res) => {
    try {
        const { title, description, category, price, language, level } = req.body;
        const instructorId = req.user.id;

        if (!title || !description || !category || !language || !level) {
            return res.status(400).json({ success: false, message: 'Please provide all required course details.' });
        }

        const newCourse = await Course.create({
            title,
            description,
            category,
            price,
            language,
            level,
            instructor: instructorId,
            isPublished: true // ✅ Auto publish
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
        console.error("Create Course Error:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};


// ========== GET: Get all courses with filtering ==========
export const getAllCourses = async (req, res) => {
    try {
        const { q, language, level, category } = req.query;

        // Agar admin hai -> sari courses, warna sirf published
        const query = {};
        if (req.user?.role !== 'admin') {
            query.isPublished = true;
        }

        if (q) query.title = { $regex: q, $options: 'i' };
        if (language) query.language = language;
        if (level) query.level = level;
        if (category) query.category = category;

        const courses = await Course.find(query).populate('instructor', 'fullname');
        res.status(200).json({ success: true, courses });
    } catch (error) {
        console.error("🔥 Get All Courses Error:", error);
        res.status(500).json({ success: false, message: "Server error.", error: error.message });
    }
};


// ========== GET: Get featured courses for home screen ==========
export const getFeaturedCourses = async (req, res) => {
    try {
        // उदाहरण: 4 सबसे नए कोर्स को फीचर्ड दिखाएं
        const courses = await Course.find({ isPublished: true })
            .sort({ createdAt: -1 })
            .limit(4)
            .populate('instructor', 'fullname');
        res.status(200).json({ success: true, courses });
    } catch (error) {
        console.error("Get Featured Courses Error:", error);
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
        console.error("Get Course By ID Error:", error);
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
            return res.status(403).json({ success: false, message: 'You are not authorized to update this course.' });
        }
        const updatedCourse = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.status(200).json({ success: true, message: "Course updated successfully.", course: updatedCourse });
    } catch (error) {
        console.error("Update Course Error:", error);
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
            return res.status(403).json({ success: false, message: 'You are not authorized to delete this course.' });
        }
        
        // --- THIS IS THE FIX ---
        // Store the title in a variable BEFORE deleting the course.
        const courseTitle = course.title;

        await course.deleteOne();
        
        // Now, use the saved variable for the activity log.
        await Activity.create({
            type: 'course_deletion',
            description: `Course "${courseTitle}" was deleted by ${req.user.fullname}.`,
            user: req.user.id
        });
    
        res.status(200).json({ success: true, message: 'Course deleted successfully.' });
    } catch (error) {
        console.error("Delete Course Error:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// ========== POST: Create a new review for a course ==========
export const createCourseReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const course = await Course.findById(req.params.id);

        if (course) {
            const review = await Review.create({
                user: req.user.id,
                course: req.params.id,
                rating,
                comment,
            });
            course.reviews.push(review._id);
            await course.save();
            res.status(201).json({ success: true, message: 'Review added successfully.' });
        } else {
            res.status(404).json({ success: false, message: 'Course not found.' });
        }
    } catch (error) {
        console.error("Create Review Error:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};