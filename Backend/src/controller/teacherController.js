import Course from '../models/courseModel.js';
import Enrollment from '../models/enrollmentModel.js'; 
import CourseMaterial from '../models/courseModel.js'; 

export const getMyCourses = async (req, res) => {
    try {
        const teacherId = req.user.id;

        const courses = await Course.find({ instructor: teacherId })
            .populate("instructor", "fullname email");

        const coursesWithDetails = await Promise.all(
            courses.map(async (course) => {
                const studentCount = await Enrollment.countDocuments({ course: course._id });
                return {
                    ...course.toObject(),
                    studentCount
                };
            })
        );

        res.status(200).json({
            success: true,
            courses: coursesWithDetails
        });
    } catch (error) {
        console.error("Get My Courses Error:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};


// ========== GET: A single course owned by the teacher ==========

export const getTeacherCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found." });
        }

      
        if (course.instructor.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: "Access denied. You do not own this course." });
        }
        
        
        const materials = await CourseMaterial.find({ course: course._id });

        res.status(200).json({ success: true, course, materials });
    } catch (error) {
        console.error("Get Teacher Course By ID Error:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// ========== POST: Upload course material to a specific course ==========

export const uploadCourseMaterial = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { title } = req.body;
        const file = req.file; 

        if (!title || !file) {
            return res.status(400).json({ success: false, message: "Title and file are required." });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found." });
        }

       
        if (course.instructor.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: "You are not authorized to add material to this course." });
        }

        
        const publicId = `courses/${courseId}/materials/${Date.now()}_${file.originalname}`;
        const uploadResult = await uploadToCloudinary(file.buffer, {
            public_id: publicId,
            resource_type: "auto" 
        });

       
        const newMaterial = await CourseMaterial.create({
            title,
            fileURL: uploadResult.secure_url,
            fileType: uploadResult.resource_type, // 'image', 'video', or 'raw' for PDFs
            course: courseId,
            uploadedBy: req.user.id,
        });

        res.status(201).json({
            success: true,
            message: "Material uploaded successfully.",
            material: newMaterial
        });

    } catch (error) {
        console.error("Upload Material Error:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

