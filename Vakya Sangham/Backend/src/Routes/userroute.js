import express from "express";
import { updateOnboarding ,getOnboardingInfo} from "../controller/userController.js";
import { verifyUser } from "../middleware/protect.js";

const router = express.Router();

// Onboarding Route
router.patch("/onboarding", verifyUser, updateOnboarding);
router.get('/onboarding', verifyUser, getOnboardingInfo);
export default router;
