const session = require("express-session");
const jwt = require("jsonwebtoken");
const md5 = require("md5");
const UserModel = require("../models/user-model");
const commonConsole = require("../common/commonConsole");
const transporter = require('../common/emailConfigurationSetup');
const { commonSuccess, commonItemCreated, commonItemNotFound, commonCatchBlock, commonBadRequest, commonUnauthorizedCall, commonAlreadyExists, commonNoContent, commonNotModified } = require("../common/commonStatusCode");

const validateUser = (data) => {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    const usernameRegex = /^[a-zA-Z][a-zA-Z0-9\-]+$/;
    const passwordRegex = /^[a-zA-Z0-9@#$%^&*]{6,16}$/;
    const errMessage = {};
    if (data.username.length < 3 || data.password.length < 3 || data.email.length < 3) {
        errMessage = "Username, password and email must be at least 3 characters long";
    } else if (data.username.length > 40 || data.password.length > 40 || data.email.length > 40) {
        errMessage = "Username, password and email must be less than 40 characters long";
    } else if (data.email.match(emailRegex) == null) {
        errMessage = "Please provide a valid email";
    } else if (data.username.match(usernameRegex) == null) {
        errMessage = "Username can only contain letters and numbers";
    } else if (data.password.match(passwordRegex) == null) {
        errMessage = "Password can only contain letters, numbers and special characters (@, #, $, %, ^, &, *) and must be between 6 and 16 characters long";
    }
    return errMessage;
};


const createUser = async (req, res, next) => {
    try {
        // first check if the username or email already exists in the database
        const user = await UserModel.findOne({ $or: [{ username: req.body.username }, { email: req.body.email }] });
        if (user) {
            commonConsole(user, "User already exists");
            next(commonAlreadyExists("User already exists"));
        }

        // validate the request body first
        const errMessage = validateUser(req.body);
        if (Object.keys(errMessage).length > 0) {
            next(commonBadRequest("Invalid input", errMessage));
        } else {
            // hash the password before saving to the database
            const hashPass = await md5(req.body.password);

            const newUser = {
                username: req.body.username,
                password: hashPass,
                email: req.body.email,
                role: req.body.role,
                status: req.body.status,
                createdAt: req.body.createdAt,
                updatedAt: req.body.updatedAt,
            }
            const user = new UserModel(newUser);
            await user.save();
            transporter.sendMail({
                to: user.email,
                from: 'nitishxsharma08@gmail.com',
                subject: 'Signup successful',
                html: `
                Dear ${user.username},<br>
                <h1>Welcome to Bug Tracker</h1>
                <p>Your account has been created successfully</p><br>
                <p>Username: ${user.username}</p>
                <p>Email: ${user.email}</p>
                <p>Created At: ${user.createdAt}</p>
                <p>Thank you for signing up with us</p><br>
                <p>For any queries, contact us at: <a href="mailto:"nitishxsharma08@gmail.com"> nitishxsharma08@gmail.com </a></p><br>
                `
            }).then(result => {
                commonConsole(result, "Email sent successfully");
            }).catch(err => {
                commonConsole(err, "Email not sent");
            });

            const data = {
                userId: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                isLoggedIn: true,
            }
            next(commonItemCreated("User created successfully", data));
        }

    } catch (error) {
        next(commonCatchBlock(error));
    }
};

const loginUser = async (req, res, next) => {
    try {
        // get the user name from the request
        const email = req.body.email;
        var password = req.body.password;
        password = md5(password); 
        // get the user from the database
        const user = await UserModel.findOne({ email: email });
        if (!user) {
            next(commonItemNotFound("User not found"));
        }
        if (user.password !== password) {
            next(commonUnauthorizedCall("Invalid password"));            
        }
        const userId = user._id.toString();
        commonConsole(user, "User found");
        const data = {
            userId: userId,
            username: user.username,
            email: user.email,
            role: user.role,
            lastSeen: user.updatedAt,
            isLoggedIn: true,
        }
        const token = await user.generateAuthToken();

        next(commonSuccess("Login successful", data, token));


    } catch (error) {
        next(commonCatchBlock(error));
    }
}


const logout = (req, res, next) => {
    try {
        session.isLoggedIn = false;
        session.userId = "";
        session.username = "";
        session.email = "";

        next(commonSuccess("Logout successful", null));
    } catch (error) {
        next(commonCatchBlock(error));
    }
}

const resetPassword = async (req, res, next) => {
    try {
        const email = req.body.email;
        const checkUser = await UserModel.findOne({ email: email });
        if (!checkUser) {
            next(commonItemNotFound("User not found"));
        }
        const password = req.body.password;
        const hashPass = md5(password);
        const user = await UserModel.findOneAndUpdate({ email: email }, { password: hashPass });
        next(commonSuccess("Password reset successful", user));        
    } catch (error) {
        next(commonCatchBlock(error));
    }
}

module.exports = {
    createUser,
    loginUser,
    logout,
    resetPassword,
}