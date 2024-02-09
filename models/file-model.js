const mongoose = require('mongoose');

// ### file
// - id            INT(11)       PRIMARY KEY       AUTO_INCREMENT
// - name          VARCHAR(50)   UNIQUE          
// - path          VARCHAR(255)                  
// - collection_Type ENUM        DEFAULT 'project' ['project', 'issue', 'comment']
// - collection_id INT(11)       FOREIGN KEY       REFERENCES project(id)
// - created_by    INT(11)       FOREIGN KEY       REFERENCES user(id)
// - created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
// - updated_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

const fileSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        unique: true,
        minlength: 3,
        maxlength: 50,
    },
    path: {
        type: String,
        required: [true, 'Please provide a path'],
        minlength: 3,
        maxlength: 255,
    },
    collection_Type: {
        type: String,
        enum: ['project', 'issue', 'comment'],
        default: 'project',
    },
    collection_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: [true, 'Please provide a project'],
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide a user'],
    },
}, { timestamps: true });

const File = mongoose.model('File', fileSchema);
module.exports = File;