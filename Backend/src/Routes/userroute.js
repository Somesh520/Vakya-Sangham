import express from "express";
import { updateOnboarding ,getOnboardingInfo ,getUserProfile } from "../controller/userController.js";
import { verifyUser } from "../middleware/protect.js";
import { handleChatStream } from "../controller/tutorController.js";

import {uploadFields} from '../middleware/multer.js'



const router = express.Router();

router.patch(
  '/onboarding',
  verifyUser,     
  uploadFields,  
  updateOnboarding  
);
router.get('/onboarding', verifyUser, getOnboardingInfo);
router.get('/profile', verifyUser, getUserProfile); 
router.post('/chat-stream', verifyUser, handleChatStream);

export default router;
