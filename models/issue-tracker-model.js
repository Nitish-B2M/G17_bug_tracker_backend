const mongoose = require('mongoose');

// ### issue_track
// - id            INT(11)       PRIMARY KEY       AUTO_INCREMENT
// - issue_id      INT(11)       FOREIGN KEY       REFERENCES issue(id)
// - assigned_to   INT(11)       FOREIGN KEY       REFERENCES user(id)
// - assigned_by   INT(11)       FOREIGN KEY       REFERENCES user(id)
// - comment       VARCHAR(255)
// - file_id       INT(11)       FOREIGN KEY       REFERENCES file(id)
// - status        ENUM          DEFAULT 'pending' ['pending', 'in progress', 'resolved' , 'on hold']
// - created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
// - updated_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

const issueTrackerSchema = new mongoose.Schema({
    issue_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Issue',
        required: [true, 'Please provide an issue'],
    },
    assigned_to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide a user who is assigned to this issue'],
    },
    assigned_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide a user who assigned this issue'],
    },
    status: {
        type: String,
        enum: ['open', 'in-progress', 'resolved', 'on-hold'],
        default: 'open',
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

const IssueTracker = mongoose.model('IssueTracker', issueTrackerSchema);
module.exports = IssueTracker;

// generate a json
// {
//     "issue_id": "60d6f1e5e4c3b7b5f0e5c8e2",
//     "assigned_to": "60d6f1e5e4c3b7b5f0e5c8e2",
//     "comment": "comment",
//     "file_id": "60d6f1e5e4c3b7b5f0e5c8e2",
//     "status": "status"
// }