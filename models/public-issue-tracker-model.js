const mongoose = require('mongoose');

// ### public_issue_tracker


const publicIssueTrackerSchema = new mongoose.Schema({
    issue_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PublicIssue',
        required: [true, 'Please provide a issue'],
    },
    last_updated_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide a user'],
    },
    status: {
        type: String,
        enum: ['open', 'closed'],
        default: 'open',
    },
}, { timestamps: true });

const PublicIssueTrackerModel = mongoose.model('PublicIssueTracker', publicIssueTrackerSchema);
module.exports = PublicIssueTrackerModel;