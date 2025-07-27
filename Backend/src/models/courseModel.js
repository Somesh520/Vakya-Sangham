import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },

  
    category: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
        default: 0 
    },
    thumbnailURL: {
        type: String,
        default: 'default_thumbnail_url_here' 
    },
    language: {
        type: String,
        required: true
    },
    level: {
        type: String,
        enum: ["Beginner", "Intermediate", "Advanced"],
        required: true,
    },

}, { timestamps: true });

const Course = mongoose.model('Course', courseSchema);
export default Course;