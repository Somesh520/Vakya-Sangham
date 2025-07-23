// routes/adminRoutes.js
import express from 'express';
import { 
    getDashboardStats, 
    getRecentActivities, 
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    promoteToTeacher 
} from '../controller/adminController.js';
import { verifyUser } from '../middleware/protect.js';
import { isAdmin } from '../middleware/isadmin.js';

const router = express.Router();


router.use(verifyUser, isAdmin);


router.get('/stats', getDashboardStats);
router.get('/activities', getRecentActivities);


router.get('/users', getAllUsers);        
router.get('/users/:id', getUserById);    
router.patch('/users/:id', updateUser);  
router.delete('/users/:id', deleteUser); 


router.patch('/users/:userId/promote', promoteToTeacher);

export default router;