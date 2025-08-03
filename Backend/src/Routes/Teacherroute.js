import express from 'express';
import { verifyUser } from '../middleware/protect.js';
import { isTeacher } from '../middleware/isteacher.js';


import { 
    createCourse, 
    updateCourse, 
    deleteCourse 
<<<<<<< HEAD
} from '../controller/coursecontroller.js';
=======
} from '../controller/courseController.js';
>>>>>>> 613bbb4c0073d8a42f746877835fb7060a2b698d


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