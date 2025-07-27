import multer from 'multer';

// Use memory storage to handle files as buffers
const storage = multer.memoryStorage();

// Define allowed file types
const fileFilter = (req, file, cb) => {
  if (file.fieldname === "profileImage") {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error("Only .jpeg and .png formats are allowed for profile images."), false);
    }
  } else if (file.fieldname === "resume") {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error("Only .pdf format is allowed for resumes."), false);
    }
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB file size limit
  }
});

// Middleware to handle 'profileImage' and 'resume' fields
export const uploadFields = upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'resume', maxCount: 1 }
]);