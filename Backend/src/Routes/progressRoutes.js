import express from 'express';
import { markLessonAsComplete } from '../controller/progressController.js';
import { verifyUser } from '../middleware/protect.js';

const router = express.Router();

router.post('/complete-lesson', verifyUser, markLessonAsComplete);

export default router;