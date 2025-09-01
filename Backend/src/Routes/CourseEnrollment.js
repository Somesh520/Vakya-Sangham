import express from 'express';
import { verifyUser } from '../middleware/protect.js';
import Enrollment from '../models/enrollmentModel.js';
import User from '../models/usermodel.js';
import Course from '../models/courseModel.js';

const router = express.Router();

// ✅ Enroll API
// File: routes/enrollmentRoute.js

router.post('/enroll', verifyUser, async (req, res) => {
    try {
        const { courseId } = req.body;
        const studentId = req.user.id;

        if (!courseId) {
            return res.status(400).json({ success: false, message: 'Course ID is required' });
        }

        // Check if an enrollment record already exists
        const existingEnrollment = await Enrollment.findOne({ course: courseId, student: studentId });

        if (existingEnrollment) {
            return res.status(200).json({
                success: true,
                message: 'Already enrolled',
            });
        }

        // --- Simplified and Corrected Logic ---
        // 1. Create the primary enrollment record
        await Enrollment.create({ 
            course: courseId, 
            student: studentId,
            // You can also set initial payment status here if the course is not free
            // paymentStatus: course.price > 0 ? 'pending' : 'completed' 
        });

        // 2. Update the user's document with the new course ID (denormalization)
        // Use $addToSet to prevent duplicates
        await User.findByIdAndUpdate(studentId, {
            $addToSet: { enrolledCourses: courseId }
        });

        res.status(201).json({
            success: true,
            message: 'Enrolled successfully',
        });

    } catch (error) {
        console.error('Enroll error:', error);
        // This will catch unique index errors if a race condition occurs
        if (error.code === 11000) {
             return res.status(409).json({ success: false, message: 'Enrollment already exists.' });
        }
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});
export default router;
