import express from 'express';
import { getMyLearning , getLessonsForCourse} from '../controller/usercourseController.js';
import { verifyUser } from '../middleware/protect.js';

const router = express.Router();

// यह रूट सिर्फ लॉग-इन किए हुए यूज़र्स के लिए है
router.get('/my-learning', verifyUser, getMyLearning);
router.get('/:courseId/lessons', verifyUser, getLessonsForCourse);
export default router;