const session = require("express-session");
// const UserModel = require("../models/user-model");
// const md5 = require('md5');

// const login = (req, res) => {
//     try {
//         console.log(req.body);
//         const email = req.body.email;
//         const password = req.body.password;
//         const hashPass = md5(password);

//         UserModel.findOne({ email: email, password: hashPass }).then((user) => {
//             if (user) {
//                 res.status(200).json({
//                     "message": "User found",
//                     "user": user
//                 });
//             } else {
//                 res.status(404).json({
//                     "message": "User not found"
//                 });
//             }
//         }).catch((error) => {
//             res.status(500).json({
//                 "message": "Error Message",
//                 error: error
//             });
//         });
//     } catch (error) {
//         res.status(500).json({
//             "message": "Error Message",
//             error: error
//         });
//     }
// }

const logout = (req, res) => {
    try {
        session.isLoggedIn = false;
        session.userId = "";
        session.username = "";
        session.email = "";

        res.status(200).json({
            "message": "You are now logged out"
        });
    } catch (error) {
        res.status(500).json({
            "message": "Error Message "+ error + " logout-controller"
        });
    }
}

const maintainLogin = (req, res) => {
    try {
        // var isLoggedIn = session.isLoggedIn;
        // if (!isLoggedIn) {
        //     return res.status(401).json({ 
        //         message: "Unauthorized",
        //     });
        // } else {
        //     return res.status(200).json({ 
        //         message: "Authorized",
        //         username: session.username,
        //         isLoggedIn: session.isLoggedIn,
        //         userId: session.userId,
        //         email: session.email, 
        //     });
        // }
        if(req.session.isLoggedIn){
            console.log(req.session);
            return res.status(200).json({ 
                message: "Authorized",
                username: req.session.username,
                isLoggedIn: req.session.isLoggedIn,
                userId: req.session.userId,
                email: req.session.email, 
            });
        } else {
            return res.status(401).json({ 
                message: "Unauthorized",
            });
        }
    } catch (error) {
        res.status(500).json({
            "message": "Error Message "+ error
        });
    }
}

module.exports = {
    // login,
    logout,
    maintainLogin,
}