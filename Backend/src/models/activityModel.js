// File: models/activityModel.js
import mongoose from 'mongoose';

// It's a good practice to define your enum values as a constant
const ACTIVITY_TYPES = [
    'user_registration',
    'user_deletion',
    'course_creation',
    'course_update',   // <-- Added
    'course_deletion', // <-- Added
    'system_update'
];

const activitySchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ACTIVITY_TYPES, // Use the constant here
    },
    description: {
        type: String,
        required: true,
    },
    user: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, { timestamps: true });

const Activity = mongoose.models.Activity || mongoose.model('Activity', activitySchema);

export default Activity;