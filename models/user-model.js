const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const md5 = require('md5');


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
    },
    role: {
        type: String,
        enum: ['developer', 'manager', 'admin', 'project manager', 'user'],
        default: 'user',
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
    },
}, { timestamps: true });

// hash the password before saving to the database
userSchema.pre('save', async function (next) {
    // method-1
    // const salt = await bcrypt.genSalt(10);
    // this.password = await bcrypt.hash(this.password, salt);
    // next();

    // method-2
    const hashPass = await md5(this.password);
    this.password = hashPass;
    next();
});

// generate a JWT token
userSchema.methods.generateAuthToken = async function () {
    try {
        const token = jwt.sign({ _id: this._id }, process.env.JWTSECRET);
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
