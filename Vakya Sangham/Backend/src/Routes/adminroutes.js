// routes/adminRoutes.js
import express from 'express';
import { 
    getDashboardStats, 
    getRecentActivities, 
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser 
} from '../controller/adminController.js';
import { verifyUser} from '../middleware/protect.js';
import { isAdmin } from '../middleware/isadmin.js';


const router = express.Router();

// Apply security middleware to all routes in this file
router.use(verifyUser, isAdmin);

// Dashboard routes
router.get('/stats', getDashboardStats);
router.get('/activities', getRecentActivities);

// ✅ ADD THESE ROUTES for full user management
router.get('/users', getAllUsers);        // Get all users
router.get('/users/:id', getUserById);    // Get a single user
router.patch('/users/:id', updateUser);   // Update a user
router.delete('/users/:id', deleteUser);  // Delete a user

export default router;