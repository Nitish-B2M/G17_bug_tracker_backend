const mongoose = require('mongoose');

// ### issue
// - id            INT(11)       PRIMARY KEY       AUTO_INCREMENT
// - title         VARCHAR(50)   UNIQUE          
// - description   VARCHAR(255)                  
// - project_id    INT(11)       FOREIGN KEY       REFERENCES project(id)
// - created_by    INT(11)       FOREIGN KEY       REFERENCES user(id)
// - status        ENUM          DEFAULT 'pending' ['pending', 'in progress', 'resolved']
// - priority      ENUM          DEFAULT 'low'     ['low', 'medium', 'high']
// - visibility    ENUM          DEFAULT 'public'  ['public', 'private']
// - feature       ENUM          DEFAULT 'bug'     ['bug', 'defect', 'enhancement']
// - due_date      DATE
// - created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
// - updated_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
// - last_updated_by INT(11)     FOREIGN KEY       REFERENCES user(id)

// unique: true, the combination of title and project_id should be unique how to do this in mongoose


const issueSchema = new mongoose.Schema({
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
    project_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: [true, 'Please provide a project'],
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide a user'],
    },
    status: {
        type: String,
        enum: ['open', 'in-progress', 'resolved', 'on-hold'],
        default: 'pending',
    },
    priority: {
        type: String,
        enum: ['blocker', 'critical', 'major', 'minor'],
        default: 'minor',
    }, 
    visibility: {
        type: String,
        enum: ['public', 'private'],
        default: 'public',
    },
    feature: {
        type: String,
        enum: ['bug', 'defect', 'enhancement'],
        default: 'bug',
    },
    due_date: {
        type: Date,
        default: null,
    },
    last_updated_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
}, { timestamps: true });

const Issue = mongoose.model('Issue', issueSchema);
module.exports = Issue;

// json post request
// {
//     "title": "Issue 1",
//     "description": "Description 1",
//     "project_id": "60d1a6c0c1d1e3b3c8e7e3d1",
//     "created_by": "60d1a6c0c1d1e3b3c8e7e3d1",
//     "status": "pending",
//     "priority": "low",
//     "visibility": "public",
//     "feature": "bug",
//     "due_date": "2021-06-30T00:00:00.000Z"
// }