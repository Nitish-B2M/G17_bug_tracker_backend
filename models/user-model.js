const mongoose = require('mongoose');
const { isEmail } = require('validator');
const jwt = require('jsonwebtoken');


// - id            INT(11)       PRIMARY KEY       AUTO_INCREMENT
// - username      VARCHAR(40)   UNIQUE          
// - password      VARCHAR(40)                  
// - email         VARCHAR(40)   UNIQUE          
// - role          ENUM          DEFAULT 'user'   ['developer', 'manager', 'admin', 'project manager', 'user']
// - status        ENUM          DEFAULT 'active' ['active', 'inactive']
// - created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
// - updated_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

// define the User schema model from above
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please provide a username'],
        unique: true,
        minlength: 3,
        maxlength: 40,
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 3,
        maxlength: 40,
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        maxlength: 40,
        validate: [isEmail, 'Please provide a valid email'],
    },
    role: {
        type: String,
        enum: ['developer', 'manager', 'admin', 'user'],
        default: 'user',
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
    },
}, { timestamps: true });

// generate a JWT token
userSchema.methods.generateAuthToken = async function () {
    try {
        const token = jwt.sign({ 
            _id: this._id,
            username: this.username,
            email: this.email,
            role: this.role,
         }, process.env.JWT_SECRET);
        return token;
    } catch (error) {
        console.log(error);
    }
};

const User = mongoose.model('User', userSchema);
module.exports = User;

// next we need to create a route to register a new user
// Path: G17_Bug_Tracking/backend/routes/users.js

// create a new user
// POST /api/users
// {
//     "username": "username",
//     "password": "password",
//     "email": "email",
//     "role": "role",
//     "status": "status",
// }
