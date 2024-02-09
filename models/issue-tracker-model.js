const mongoose = require('mongoose');

// ### issue_track
// - id            INT(11)       PRIMARY KEY       AUTO_INCREMENT
// - issue_id      INT(11)       FOREIGN KEY       REFERENCES issue(id)
// - assigned_to   INT(11)       FOREIGN KEY       REFERENCES user(id)
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
        required: [true, 'Please provide a user'],
    },
    comment: {
        type: String,
        required: [true, 'Please provide a comment'],
        minlength: 3,
        maxlength: 255,
    },
    file_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File',
        default: null,
    },
    status: {
        type: String,
        enum: ['pending', 'in progress', 'resolved', 'on hold'],
        default: 'pending',
    },
}, { timestamps: true });

const IssueTracker = mongoose.model('IssueTrack', issueTrackerSchema);
module.exports = IssueTracker;

// generate a json
// {
//     "issue_id": "60d6f1e5e4c3b7b5f0e5c8e2",
//     "assigned_to": "60d6f1e5e4c3b7b5f0e5c8e2",
//     "comment": "comment",
//     "file_id": "60d6f1e5e4c3b7b5f0e5c8e2",
//     "status": "status"
// }