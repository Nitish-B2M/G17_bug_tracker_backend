const UserModel = require("../models/user-model");
const md5 = require('md5');

const login = (req, res) => {
    try {
        console.log(req.body);
        const email = req.body.email;
        const password = req.body.password;
        const hashPass = md5(password);

        UserModel.findOne({ email: email, password: hashPass }).then((user) => {
            if (user) {
                res.status(200).json({
                    "message": "User found",
                    "user": user
                });
            } else {
                res.status(404).json({
                    "message": "User not found"
                });
            }
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
}

module.exports = {
    login,
}