import User from '../models/userModel.js';

export const isTeacherOrAdmin = async (req, res, next) => {
    try {
      
        const user = await User.findById(req.user.id);

        if (user && (user.role === 'admin' || user.role === 'teacher')) {
            next();
        } else {
            return res.status(403).json({ 
                success: false, 
                message: 'Forbidden: You do not have permission to perform this action.' 
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};