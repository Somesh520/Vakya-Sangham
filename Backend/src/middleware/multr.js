// middleware/multer.js
import multer from 'multer';

// Multer ko memory mein file store karne ke liye configure karein
const storage = multer.memoryStorage();

// Multer ka upload instance banayein
export const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024 // Optional: 100 MB file size limit
    }
});