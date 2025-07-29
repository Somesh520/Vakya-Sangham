import Course from '../models/courseModel.js';
import Activity from '../models/activityModel.js'; // To log course creation


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
        });
        
        
        await Activity.create({
            action: 'COURSE_CREATION',
            details: `Course "${newCourse.title}" was created by ${req.user.fullName}.`,
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


export const updateCourse = async (req, res) => {
    try {
        const courseId = req.params.id;
        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found.' });
        }

       
        if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'You are not authorized to update this course.' });
        }

        const updatedCourse = await Course.findByIdAndUpdate(
            courseId, 
            req.body, 
            { new: true, runValidators: true }
        );

        res.status(200).json({ 
            success: true, 
            message: "Course updated successfully.",
            course: updatedCourse 
        });
    } catch (error) {
        console.error("Update Course Error:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// ========== DELETE: Delete a course ==========

export const deleteCourse = async (req, res) => {
    try {
        const courseId = req.params.id;
        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found.' });
        }
        
       
        if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'You are not authorized to delete this course.' });
        }
        
        
        
        
        await course.deleteOne();
        
        res.status(200).json({ success: true, message: 'Course deleted successfully.' });
    } catch (error)
        {
        console.error("Delete Course Error:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};
