import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ['user', 'assistant'],
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

const conversationHistorySchema = new mongoose.Schema({
    // User se link, taaki har user ki apni history ho
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    // Lesson se link, taaki har lesson ki chat alag save ho (optional)
    lesson: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Lesson', 
        required: true 
    },
    // User aur AI ke beech ki poori बातचीत
    messages: [messageSchema],
}, {
    timestamps: true // `createdAt` aur `updatedAt` fields
});

// --- OPTIMIZATION ---
// Isse database 'user' aur 'lesson' ke combination ko bahut tezi se dhoond payega.
conversationHistorySchema.index({ user: 1, lesson: 1 });

const ConversationHistory = mongoose.model('ConversationHistory', conversationHistorySchema);

export default ConversationHistory;