const md5 = require('md5');
const UserModel = require('../models/user-model');
const jwt = require('jsonwebtoken');
const session = require('express-session');

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

const getAllUsers = async (req, res) => {
    try {
        // get all users from the database
        const users = await UserModel.find({});
        // print out the users in readable format
        console.log(JSON.stringify(users, null, 4));
        res.status(200).json({
            "message": "All users",
            "users": users
        });
    } catch (error) {
        res.status(500).json({
            "message": "Error Message",
            error: error
        });
    }
};

const getUser = async (req, res) => {
    try {
        // get the user name from the request
        const username = req.params.username;

        UserModel.findOne({ username: username }).then((user) => {
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            res.status(200).json({
                message: "All users",
                user: user,
            });
        }).catch((error) => {
            res.status(500).json({
                "message": "Error Message",
                error: error
            });
        });

        
    } catch (error) {
        res.status(500).json({
            "message": "Error Message",
            error: error
        });
    }
};

const createUser = async (req, res) => {
    try {
        console.log(req.body);

        // first check if the username or email already exists in the database
        const user = await UserModel.findOne({ $or: [{ username: req.body.username }, { email: req.body.email }] });
        if (user) {
            console.log("Username or email already exists");
            return res.status(400).json({ 
                errMessage: "Username or email already exists" 
            });
        }

        // validate the request body first
        const errMessage = validateUser(req.body);
        if (Object.keys(errMessage).length > 0) {
            return res.status(400).json({
                errMessage
            });
        } else {
            const newUser = {
                username: req.body.username,
                password: req.body.password,
                email: req.body.email,
                role: req.body.role,
                status: req.body.status,
                createdAt: req.body.createdAt,
                updatedAt: req.body.updatedAt,
            }
            const user = new UserModel(newUser);
            await user.save();
            res.status(201).json(
                {
                    "message": "User created",
                    "createdUser": user
                }
            );
        }

    } catch (error) {
        
        const errMessage = "Server error";
        console.log(errMessage);
        res.status(500).json({errMessage});
    }
};

const updateUser = async (req, res) => {
    try {
        // get the user name from the request
        const username = req.params.username;
        // get the user from the database
        const user = await UserModel.findOne({ username: username });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // update the user
        user.username = req.body.username;
        user.email = req.body.email;       
        const errors = validateUser(req.body);
        if (Object.keys(errors).length > 0) {
            return res.status(400).json(errors);
        } else {
            user.password = req.body.password;
            user.role = req.body.role;
            user.status = req.body.status;
            user.updatedAt = req.body.updatedAt;
            await user.save();
            res.status(200).json(
                {
                    "message": "User updated",
                    "updatedUser": user
                }
            );
        }
        
    } catch (error) {
        res.status(500).json({
            "message": "Error Message",
            error: error
        });
    }
};

const deleteUser = async (req, res) => {
    try {
        // get the user name from the request
        const username = req.params.username;
        // delete the user from the database
        const deletedUser = await UserModel.findOneAndDelete({ username: username });
        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        
        res.status(200).json({
            message: "User deleted",
            deletedUser: deletedUser
        });        
    } catch (error) {
        res.status(500).json({
            "message": "Error Message",
            error: error
        });
    }
};

const loginUser = async (req, res) => {
    try {
        // get the user name from the request
        const email = req.body.email;
        var password = req.body.password;
        password = md5(password); 
        // get the user from the database
        const user = await UserModel.findOne({ email: email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (user.password !== password) {
            return res.status(401).json({ message: "Invalid password" });
        }

        // generate a token
        jwt.sign({ userId: user._id, role: user.role,  }, process.env.JWT_SECRET, { expiresIn: "10m" }, (err, token) => {
            if (err) {
                return res.status(500).json({ status: false });
            }
            console.log(token, "196");
            req.session.token = user._id + " : " + token;
        });

        req.session.isLoggedIn = true;
        req.session.userId = user._id;
        req.session.username = user.username;
        req.session.email = user.email;
        req.session.role = user.role;
        console.log(req.session.isLoggedIn, "210 session");
        console.log(req.session.userId, "216 session");

        res.status(200).json({
            message: "Login successful",
            user: {
                username: req.session.username,
                email: req.session.email,
                role: req.session.role,
            },
            isLoggedIn: req.session.isLoggedIn,
        });

    } catch (error) {
        res.status(500).json({
            "message": "Error Message" + error,
            isLoggedIn: false,
        });
    }
}


module.exports = { 
    getAllUsers, 
    getUser,
    createUser,
    updateUser,
    deleteUser,
    loginUser,
};
