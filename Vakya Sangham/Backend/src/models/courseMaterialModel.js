import mongoose from 'mongoose';

const courseMaterialSchema = new mongoose.Schema({
    title: { type: String, required: true },
    fileURL: { type: String, required: true }, // The URL from Cloudinary
    fileType: { type: String, required: true }, // e.g., 'pdf', 'video'
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

const CourseMaterial = mongoose.model('CourseMaterial', courseMaterialSchema);
export default CourseMaterial;