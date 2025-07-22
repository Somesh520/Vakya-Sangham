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
        ref: 'User', // Refers to a user in your User collection
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

const Course = mongoose.model('Course', courseSchema);
export default Course;