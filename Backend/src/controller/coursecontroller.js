import Course from '../models/courseModel.js';
import Activity from '../models/activityModel.js';
import Review from '../models/Review.js';
import { uploadToCloudinary } from '../config/cloudinary.js';
import UserProgress from '../models/UserProgressModel.js';
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

        // --- Naya Code Start Hua ---
        let thumbnailURL = ''; // Default empty URL

        // Agar file upload hui hai, toh usse Cloudinary par daalo
        if (req.file) {
            console.log("Thumbnail file received, uploading to Cloudinary...");
            const instructorName = req.user.fullname.replace(/\s+/g, '-').toLowerCase();

            const result = await uploadToCloudinary(req.file.buffer, {
                folder: `thumbnails/${instructorName}`, // A dedicated folder for thumbnails
                resource_type: 'image',
            });
            thumbnailURL = result.secure_url;
            console.log("Thumbnail uploaded successfully:", thumbnailURL);
        }
        // --- Naya Code Yahan Tak ---

        const newCourse = await Course.create({
            title,
            description,
            category,
            price,
            language,
            level,
            instructor: instructorId,
            thumbnailURL, // Thumbnail URL ko yahan add karein
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
    // Log the full error response from the server
    if (error.response) {
        console.error("Server Error Response:", JSON.stringify(error.response.data, null, 2));
    } else {
        console.error("Failed to save course:", error);
    }

    const message = error.response?.data?.message || "Could not save the course.";
    Alert.alert("Error", message);
}
};

// ========== GET: Get all courses with filtering ==========
// controller/coursecontroller.js

// ... (all other functions remain the same)

// ========== GET: Get all courses with filtering ==========
export const getAllCourses = async (req, res) => {
    try {
        const { q, language, level, category } = req.query;

        const query = {};
        if (req.user?.role !== 'admin') query.isPublished = true;

        // ✅ IMPROVEMENT: Changed regex to find the query anywhere in the title, not just at the start.
        if (q) query.title = { $regex: q, $options: 'i' }; 

        if (language) query.language = { $regex: `^${language}$`, $options: 'i' };
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
// ========== GET: Get Course Content for Enrolled Students ==========
export const getCourseContent = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user.id;

        // Course ki details fetch karein
        const course = await Course.findById(courseId)
            .populate('instructor', 'fullname'); 

        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found.' });
        }

        // Us user ka us course ke liye progress find karein
        const userProgress = await UserProgress.findOne({ user: userId, course: courseId });

        // Course aur progress, dono ko response mein bhejein
        res.status(200).json({ 
            success: true,
            course,
            userProgress // Agar progress nahi hai to yeh 'null' hoga
        });

    } catch (error) {
        console.error("🔥 Get Content Error:", error);
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
        
        const updateData = { ...req.body };

        // --- Naya Code Start Hua ---
        // Check karein agar nayi thumbnail file aayi hai
        if (req.file) {
            console.log("New thumbnail received for update, uploading...");
            const instructorName = req.user.fullname.replace(/\s+/g, '-').toLowerCase();

            const result = await uploadToCloudinary(req.file.buffer, {
                folder: `thumbnails/${instructorName}`,
                resource_type: 'image',
            });
            // Update data mein naya URL add karein
            updateData.thumbnailURL = result.secure_url;
             console.log("Thumbnail updated successfully:", updateData.thumbnailURL);
        }
        // --- Naya Code Yahan Tak ---

        const updatedCourse = await Course.findByIdAndUpdate(
            req.params.id,
            updateData, // req.body ke bajaye updateData use karein
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
// courseController.js (aapki controller file)

export const addLessonToModule = async (req, res) => {
    try {
        const { courseId, moduleId } = req.params;
     
        const { title, duration, lessonType, videoUrl } = req.body;

        if (!title || !duration || !lessonType) {
            return res.status(400).json({ success: false, message: 'Title, duration, and lesson type are required.' });
        }
        
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found.' });
        }

        // Authorization check (aapka code)
        if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized.' });
        }

        const module = course.modules.id(moduleId);
        if (!module) {
            return res.status(404).json({ success: false, message: 'Module not found.' });
        }

        const newLesson = { title, duration, lessonType };

        // ✅ BADLAV 2: Logic to handle video link OR PDF upload
        if (lessonType === 'video') {
            if (!videoUrl) {
                return res.status(400).json({ success: false, message: 'Video URL is required for video lessons.' });
            }
            newLesson.videoUrl = videoUrl;

        } else if (lessonType === 'pdf') {
            if (!req.file) {
                return res.status(400).json({ success: false, message: 'PDF file is required for PDF lessons.' });
            }

            // PDF ko Cloudinary par upload karein
            console.log("Uploading PDF to Cloudinary...");
            const instructorName = req.user.fullname.replace(/\s+/g, '-').toLowerCase();

            const cloudinaryResult = await uploadToCloudinary(req.file.buffer, {
                folder: `courses/${instructorName}/${courseId}/pdfs`, // PDF ke liye alag folder
                resource_type: 'raw', // PDF ke liye 'raw' use karna accha hai
                format: 'pdf'
            });
            console.log("PDF Upload successful!");
            
            newLesson.pdfUrl = cloudinaryResult.secure_url;
            newLesson.pdfOriginalName = req.file.originalname;

        } else {
            return res.status(400).json({ success: false, message: 'Invalid lesson type provided.' });
        }

        module.lessons.push(newLesson);
        await course.save();

        res.status(201).json({ success: true, message: 'Lesson added successfully.', course });

    } catch (error) {
        console.error("🔥 Add Lesson Error:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};
