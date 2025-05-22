const mongoose = require('mongoose');

const taskSchema = mongoose.Schema({
     partnerName: {
        type: String,
        required: true,
    },
    position: {
        type: String,
        required: true,
    },
    callsShadowed: {
        type: Number,
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    feedback: {
        type: String,
        default: null, // Optional field
    },
    marks: {
        type: Number,
        required: false,
    },
    percentage: {
        type: Number,
        required: false,
    },
    rating: {
        type: String,
        required: false,
    },
        isCompleted: {
        type: String,
        required: false,
    },
    comments: {
        type: String,
        default: null, // Optional field
    }},
     {
    timestamps: true,
});

const taskmodel = mongoose.model('taskmodel', taskSchema);

module.exports = taskmodel;