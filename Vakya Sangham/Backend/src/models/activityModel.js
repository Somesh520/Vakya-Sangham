import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
    action: {
        type: String,
        required: true,
        // Example actions: 'USER_REGISTRATION', 'COURSE_CREATION', 'SYSTEM_UPDATE'
    },
    details: {
        type: String,
        required: true,
        // Example: "Liam Harper registered.", "Introduction to Physics was created."
    },
    user: { // The user who performed the action (optional, for system actions)
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
}, { timestamps: true }); // 'createdAt' will be our timestamp

const Activity = mongoose.model('Activity', activitySchema);
export default Activity;