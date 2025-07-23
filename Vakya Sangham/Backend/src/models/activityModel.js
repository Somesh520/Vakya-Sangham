import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
    action: {
        type: String,
        required: true,
        
    },
    details: {
        type: String,
        required: true,
        
    },
    user: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
}, { timestamps: true }); 

const Activity = mongoose.model('Activity', activitySchema);
export default Activity;