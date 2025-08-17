import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    videoURL: {
        type: String,
        required: true
    },
    duration: { // in minutes
        type: Number,
        required: true
    }
});

const moduleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    lessons: [lessonSchema] // ✅ हर मॉड्यूल के अंदर कई लेसन होंगे
});

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
    isPublished: { // ✅ 'isActive' की जगह 'isPublished' ज़्यादा स्पष्ट है
        type: Boolean,
        default: false,
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
        default: '' 
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
    modules: [moduleSchema],
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
    }]

}, { timestamps: true });

const Course = mongoose.models.Course || mongoose.model('Course', courseSchema);

export default Course;