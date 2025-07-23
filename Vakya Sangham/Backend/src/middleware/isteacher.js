
export const isTeacher = (req, res, next) => {
 
  if (req.user && req.user.role === 'teacher') {
  
    next();
  } else {
   
    return res.status(403).json({
      success: false,
      message: 'Access denied. Teacher role required.',
    });
  }
};