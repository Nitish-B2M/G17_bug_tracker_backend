const mongoose = require('mongoose');

const prSchema = new mongoose.Schema({
    issuetracker_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'IssueTracker',
        required: true
    },
    issue_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Issue',
        required: true
    },
    project_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    creator_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    file: {
        type: [String]
    }
}, { timestamps: true });

module.exports = mongoose.model('PR', prSchema);
