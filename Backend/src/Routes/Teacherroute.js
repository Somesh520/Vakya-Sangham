import express from 'express';
import { verifyUser } from '../middleware/protect.js';
import { isTeacher } from '../middleware/isteacher.js';


import { 
    createCourse, 
    updateCourse, 
    deleteCourse 

} from '../controller/coursecontroller.js';



import { 
    getMyCourses, 
    getTeacherCourseById, 
    uploadCourseMaterial 
} from '../controller/teacherController.js';

const router = express.Router();


router.use(verifyUser, isTeacher);




router.get('/courses', getMyCourses);


router.post('/courses', createCourse);


router.get('/courses/:id', getTeacherCourseById);


router.patch('/courses/:id', updateCourse);


router.delete('/courses/:id', deleteCourse);


// --- Content Management ---


router.post('/courses/:courseId/materials', uploadCourseMaterial);


export default router;