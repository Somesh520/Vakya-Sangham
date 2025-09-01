import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    duration: { // in minutes
        type: Number,
        required: true
    },
    // ✅ BADLAV 1: Lesson ka type batane ke liye
    lessonType: {
        type: String,
        enum: ['video', 'pdf'], // Lesson ya to video hoga ya pdf
        required: true,
    },
    // ✅ BADLAV 2: YouTube link ke liye
    videoUrl: { 
        type: String, 
        trim: true 
    },
    // ✅ BADLAV 3: PDF link ke liye
    pdfUrl: { 
        type: String,
        trim: true
    },
    // ✅ BADLAV 4: PDF ka original naam save karne ke liye
    pdfOriginalName: {
        type: String,
        trim: true
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