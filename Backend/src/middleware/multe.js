// middlewares/multer.js
import multer from 'multer';

// Use memory storage to handle the file as a buffer
const storage = multer.memoryStorage();

const singleUpload = multer({ storage }).single('thumbnail'); 
// 'thumbnail' must match the key you use in FormData on the frontend

export default singleUpload;