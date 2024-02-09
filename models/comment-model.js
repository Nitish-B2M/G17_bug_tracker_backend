const mongoose = require('mongoose');

// ### comment
// - id            INT(11)       PRIMARY KEY       AUTO_INCREMENT
// - description   VARCHAR(255)                  
// - file_id       INT(11)       FOREIGN KEY       REFERENCES file(id)
// - issue_id      INT(11)       FOREIGN KEY       REFERENCES issue(id)
// - created_by    INT(11)       FOREIGN KEY       REFERENCES user(id)
// - parent_id     INT(11)       FOREIGN KEY       REFERENCES comment(id)
// - created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
// - updated_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

const commentSchema = new mongoose.Schema({
    description: {
        type: String,
        required: [true, 'Please provide a description'],
        minlength: 3,
        maxlength: 255,
    },
    file_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File',
        default: null,
    },
    issue_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Issue',
        required: [true, 'Please provide an issue'],
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide a user'],
    },
    parent_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        default: null,
    },
}, { timestamps: true });

const Comment = mongoose.model('Comment', commentSchema);
exports.Comment = Comment;