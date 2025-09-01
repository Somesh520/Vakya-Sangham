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
    },
    // ✅ Payment Integration Fields
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    paymentId: { type: String }, // store Stripe/PayPal payment ID
    pricePaid: { type: Number, default: 0 } // actual paid amount
}, {
    timestamps: true
});

// ✅ Ensure one enrollment per student per course
enrollmentSchema.index({ course: 1, student: 1 }, { unique: true });

// Optional: middleware to mark completedAt when completed is true
enrollmentSchema.pre('save', function (next) {
    if (this.completed && !this.completedAt) {
        this.completedAt = new Date();
    }
    next();
});

const Enrollment = mongoose.models.Enrollment || mongoose.model('Enrollment', enrollmentSchema);
export default Enrollment;
