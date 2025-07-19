import express from "express";
import { updateOnboarding } from "../controller/userController.js";
import { verifyUser } from "../middleware/protect.js";

const router = express.Router();

// Onboarding Route
router.put("/onboarding", verifyUser, updateOnboarding);

export default router;
