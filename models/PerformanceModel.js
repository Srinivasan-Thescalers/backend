const mongoose = require('mongoose');

const performanceSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    partnerName: {
        type: String,
        required: true,
    },
    position: {
        type: String,
        required: true,
    },
    marks: {
        type: Number,
        required: true,
    },
    percentage: {
        type: Number,
        required: true,
    },
    rating: {
        type: String,
        required: true,
    },
        isCompleted: {
        type: String,
        required: true,
    }
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
});

const PerformanceModel = mongoose.model('PerformanceModel', performanceSchema);

module.exports = PerformanceModel;