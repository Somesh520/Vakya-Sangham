import express from "express";
import { updateOnboarding ,getOnboardingInfo} from "../controller/userController.js";
import { verifyUser } from "../middleware/protect.js";


import {uploadFields} from '../middleware/multer.js'



const router = express.Router();

router.patch(
  '/onboarding',
  verifyUser,     
  uploadFields,  
  updateOnboarding  
);
router.get('/onboarding', verifyUser, getOnboardingInfo);



export default router;
