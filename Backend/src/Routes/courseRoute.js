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
    addLessonToModule,
    getCourseContent
} from '../controller/coursecontroller.js';
import { isEnrolled } from '../middleware/isEnrolled.js';
import { verifyUser } from '../middleware/protect.js';
import { isTeacherOrAdmin } from '../middleware/check.js';
// ✅ BADLAV 1: Yahan 'upload' ko 'multr.js' se import kiya hai.
import { upload } from '../middleware/multr.js'; 
import singleUpload from '../middleware/multe.js';

const router = express.Router();

// --- Public Routes ---
router.get('/', getAllCourses);
router.get('/featured', getFeaturedCourses);

// --- Protected Routes for Students ---
router.post('/:id/reviews', verifyUser, createCourseReview);

// --- Protected Routes for Admins & Teachers ---
router.post('/createcourse', verifyUser, isTeacherOrAdmin, singleUpload, createCourse);
router.patch('/:id', verifyUser, isTeacherOrAdmin, singleUpload, updateCourse);
router.delete('/:id', verifyUser, isTeacherOrAdmin, deleteCourse);
router.post('/:courseId/modules', verifyUser, isTeacherOrAdmin, addModuleToCourse);

// ✅ BADLAV 2: 'upload.single('video')' ko 'upload.single('pdf')' se badal diya hai
router.post(
    '/:courseId/modules/:moduleId/lessons', 
    verifyUser, 
    isTeacherOrAdmin, 
    upload.single('pdf'), // <<< YAHI ASLI CHANGE HAI
    addLessonToModule
);

// --- Must be LAST so it doesn’t conflict ---
router.get('/:id', getCourseById);
router.get('/:courseId/content', verifyUser, isEnrolled, getCourseContent);

export default router;