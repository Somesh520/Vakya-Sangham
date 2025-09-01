import mongoose from 'mongoose';

const userProgressSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    currentLessonStep: { type: mongoose.Schema.Types.ObjectId, ref: 'LessonStep' },
    
    // --- YEH NAYA FIELD ADD KAREIN ---
    // User ne jo lessons poore kar liye hain, unki ID yahan save hogi
    completedLessons: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Lesson' 
    }]
});

const UserProgress = mongoose.model('UserProgress', userProgressSchema);
export default UserProgress;