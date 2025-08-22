import express from 'express';
import { 
    createCourse, 
    getAllCourses,
    getFeaturedCourses,
    getCourseById,
    updateCourse,
    deleteCourse,
    createCourseReview,
     addModuleToCourse,
     addLessonToModule  
} from '../controller/coursecontroller.js';
import { verifyUser } from '../middleware/protect.js';
import { isTeacherOrAdmin } from '../middleware/check.js';

const router = express.Router();

// --- Public Routes ---
router.get('/courses', getAllCourses); // ✅ Get all courses
router.get('/featured', getFeaturedCourses); // ✅ Featured courses

// --- Protected Routes for Students ---
router.post('/:id/reviews', verifyUser, createCourseReview);

// --- Protected Routes for Admins & Teachers ---
router.post('/createcourse', verifyUser, isTeacherOrAdmin, createCourse); // ✅ New course
router.patch('/:id', verifyUser, isTeacherOrAdmin, updateCourse); // ✅ Update course
router.delete('/:id', verifyUser, isTeacherOrAdmin, deleteCourse); // ✅ Delete course
router.post('/:courseId/modules', verifyUser, isTeacherOrAdmin, addModuleToCourse);
router.post('/:courseId/modules/:moduleId/lessons', verifyUser, isTeacherOrAdmin, addLessonToModule);
// --- Must be LAST so it doesn’t conflict ---
router.get('/:id', getCourseById); // ✅ Single course by ID


export default router;
