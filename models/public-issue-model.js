const mongoose = require('mongoose');

// ### public_issue
// - id            INT(11)       PRIMARY KEY       AUTO_INCREMENT
// - title         VARCHAR(50)   UNIQUE
// - description   VARCHAR(255)
// - created_by    INT(11)       FOREIGN KEY       REFERENCES user(id)
// - feature       ENUM          DEFAULT 'bug'     ['bug', 'defect', 'enhancement']
// - created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
// - updated_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

const publicIssueSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a title'],
        minlength: 3,
        maxlength: 50,
    },
    description: {
        type: String,
        required: [true, 'Please provide a description'],
        minlength: 3,
        maxlength: 255,
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide a user'],
    },
    feature: {
        type: String,
        enum: ['bug', 'defect', 'enhancement'],
        default: 'bug',
    },
    votes: {
        type: Number,
        default: 0,
    },
    file_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File',
    },
}, { timestamps: true });

const PublicIssueModel = mongoose.model('PublicIssue', publicIssueSchema);
module.exports = PublicIssueModel;