const { default: mongoose } = require('mongoose');

// ### project 
// - id            INT(11)       PRIMARY KEY       AUTO_INCREMENT
// - name          VARCHAR(50)   UNIQUE          
// - description   VARCHAR(255)                  
// - file_id       INT(11)       FOREIGN KEY       REFERENCES file(id)
// - created_by    INT(11)       FOREIGN KEY       REFERENCES user(id)
// - lead          INT(11)       FOREIGN KEY       REFERENCES user(id)
// - created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
// - updated_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
// - status        ENUM          DEFAULT 'active' ['active', 'inactive']
// - department    ENUM          DEFAULT 'general' ['general', 'UI', 'backend', 'database', 'testing', 'security']

const projectSchema = new mongoose.Schema({
    projectname: {
        type: String,
        required: [true, 'Please provide a projectname'],
        unique: true,
        minlength: 3,
        maxlength: 50,
    },
    title: {
        type: String,
        required: [true, 'Please provide a title'],
        minlength: 3,
        maxlength: 150,
    },
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
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide a user'],
    },
    lead: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide a user'],
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
    },
    department: {
        type: String,
        enum: ['general', 'UI', 'backend', 'database', 'testing', 'security'],
        default: 'general',
    },
}, { timestamps: true });

const ProjectModel = mongoose.model('Project', projectSchema);
module.exports = ProjectModel;


// create json data for project

// {
//     "projectname": "project1",
//     "title": "project1",
//     "description": "project1",
//     "file_id": "/file/filepath1",
//      import user id from user table user_id = 65b6b6b8d9df8dd43ddade6b
//     "created_by": "65b6b6b8d9df8dd43ddade6b",
//     "lead":  "65b6b6b8d9df8dd43ddade6b",
//     "status": "active",
//     "department": "general"
// }