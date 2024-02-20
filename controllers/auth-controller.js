const session = require("express-session");
const jwt = require("jsonwebtoken");
const md5 = require("md5");
const UserModel = require("../models/user-model");

const validateUser = (data) => {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    const usernameRegex = /^[a-zA-Z][a-zA-Z0-9]+$/;
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
        console.log(req.body);

        // first check if the username or email already exists in the database
        const user = await UserModel.findOne({ $or: [{ username: req.body.username }, { email: req.body.email }] });
        if (user) {
            console.log("Username or email already exists");
            next({
                statusCode: 400,
                status: false,
                message: "Username or email already exists",
            });
        }

        console.log("User does not exist");

        // validate the request body first
        const errMessage = validateUser(req.body);
        if (Object.keys(errMessage).length > 0) {
            next({
                statusCode: 400,
                status: false,
                message: "Validation Error",
                extraDetails: errMessage,
            });
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
            next({
                statusCode: 201,
                status: true,
                message: "User created successfully",
                data: {
                    userId: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    isLoggedIn: true,
                }
            });
        }

    } catch (error) {
        next({
            statusCode: 500,
            status: false,
            message: "Internal Server Error",
            extraDetails: error,
        });
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
            next({
                statusCode: 401,
                status: false,
                message: "User not found",
            });
        }
        if (user.password !== password) {
            next({
                statusCode: 401,
                status: false,
                message: "Invalid password",
                extraDetails: "The password you entered is incorrect",
            });
        }
        const userId = user._id.toString();
        console.log(userId);
        next({
            statusCode: 200,
            status: true,
            message: "Login successful",
            data: {
                userId: userId,
                username: user.username,
                email: user.email,
                role: user.role,
                lastSeen: user.updatedAt,
                isLoggedIn: true,
            },
            extraDetails: {
                token: await user.generateAuthToken(),
            },
        });

    } catch (error) {
        next({
            statusCode: 500,
            status: false,
            message: "Internal Server Error",
            extraDetails: error,
        });
    }
}


const logout = (req, res, next) => {
    try {
        session.isLoggedIn = false;
        session.userId = "";
        session.username = "";
        session.email = "";

        next({
            statusCode: 200,
            status: true,
            message: "Logout successful",
        });
    } catch (error) {
        next({
            statusCode: 500,
            status: false,
            message: "Internal Server Error",
            extraDetails: error,
        });
    }
}

const maintainLogin = (req, res) => {
    
}

module.exports = {
    createUser,
    loginUser,
    logout,
    maintainLogin,
}