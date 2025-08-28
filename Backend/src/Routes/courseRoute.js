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
     addLessonToModule  ,
      getCourseContent
} from '../controller/coursecontroller.js';
import { isEnrolled } from '../middleware/isEnrolled.js';
import { verifyUser } from '../middleware/protect.js';
import { isTeacherOrAdmin } from '../middleware/check.js';
import { upload } from '../middleware/multr.js';
import singleUpload from '../middleware/multe.js'
const router = express.Router();

// --- Public Routes ---
router.get('/', getAllCourses); // ✅ Get all courses
router.get('/featured', getFeaturedCourses); // ✅ Featured courses

// --- Protected Routes for Students ---
router.post('/:id/reviews', verifyUser, createCourseReview);

// --- Protected Routes for Admins & Teachers ---
router.post('/createcourse', verifyUser, isTeacherOrAdmin,singleUpload, createCourse); // ✅ New course

router.patch('/:id', verifyUser, isTeacherOrAdmin,singleUpload, updateCourse); // ✅ Update course
router.delete('/:id', verifyUser, isTeacherOrAdmin, deleteCourse); // ✅ Delete course
router.post('/:courseId/modules', verifyUser, isTeacherOrAdmin, addModuleToCourse);
router.post(
    '/:courseId/modules/:moduleId/lessons', 
    verifyUser, 
    isTeacherOrAdmin, 
    upload.single('video'), // ✅ Yeh line file ko pakad kar memory mein daal degi
    addLessonToModule
);
// --- Must be LAST so it doesn’t conflict ---
router.get('/:id', getCourseById); // ✅ Single course by ID
router.get('/:courseId/content', verifyUser, isEnrolled, getCourseContent);

export default router;
