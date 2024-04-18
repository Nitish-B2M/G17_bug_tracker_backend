const mongoose = require('mongoose');

// ### public_interaction
// - id            INT(11)       PRIMARY KEY       AUTO_INCREMENT
// - user_id       INT(11)       NOT NULL
// - issue_id      INT(11)       NOT NULL
// - interaction   ENUM          DEFAULT 'upvote'   ['upvote', 'downvote']
// - created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
// - updated_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

const publicInteractionSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide a user'],
    },
    issue_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PublicIssue',
        required: [true, 'Please provide an issue'],
    },
    interaction: {
        type: String,
        enum: ['upvote', 'downvote'],
        default: 'upvote',
    },
}, { timestamps: true });

const PublicInteractionModel = mongoose.model('PublicInteraction', publicInteractionSchema);
module.exports = PublicInteractionModel;