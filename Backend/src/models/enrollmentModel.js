import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema({
    
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course', 
        required: true
    },
    
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true
    },
   
    progress: {
        type: Number,
        default: 0,
        min: [0, 'Progress cannot be less than 0.'],
        max: [100, 'Progress cannot be greater than 100.']
    },
    
    completed: {
        type: Boolean,
        default: false
    },
    
    completedAt: {
        type: Date
    }
}, {
    timestamps: true 
});


enrollmentSchema.index({ course: 1, student: 1 }, { unique: true });


const Enrollment = mongoose.model('Enrollment', enrollmentSchema);
export default Enrollment;