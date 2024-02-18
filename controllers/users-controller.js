const UserModel = require('../models/user-model');

const commonCatchBlock = (error, next) => {
    next({
        statusCode: 500,
        status: false,
        message: "Internal Server Error",
        extraDetails: error,
    });
};

const getAllUsers = async (req, res, next) => {
    try {
        // get all users from the database
        const users = await UserModel.find({});
        // print out the users in readable format
        console.log(JSON.stringify(users, null, 4));
        next({
            statusCode: 200,
            status: true,
            message: "All users",
            data: users,
        });
    } catch (error) {
        commonCatchBlock(error, next);
    }
};

const getUser = async (req, res, next) => {
    try {
        // get the user name from the request
        const userId = req.params.userId;

        UserModel.findOne({ _id: userId }).then((user) => {
            if (!user) {
                next({
                    statusCode: 404,
                    status: false,
                    message: "User not found",
                });
            }
            next({
                statusCode: 200,
                status: true,
                message: "User found",
                data: user,
            });
        }).catch((error) => {
            commonCatchBlock(error, next);
        });

        
    } catch (error) {
        commonCatchBlock(error, next);
    }
};

const updateUser = async (req, res, next) => {
    try {
        // get the user name from the request
        const userId = req.params.userId;
        console.log(userId);
        // get the user from the database
        const user = await UserModel.findOne({ _id: userId });
        if (!user) {
            next({
                statusCode: 404,
                status: false,
                message: "User not found",
            });
        }
        // first check is username is send in the request
        if (req.body.updatedAt !== undefined) {
            user.updatedAt = req.body.updatedAt;
        }
        await user.save();
        next({
            statusCode: 200,
            status: true,
            message: "User updated",
            data: user,
        });


        // const errors = validateUser(req.body);
        // if (Object.keys(errors).length > 0) {
        //     next({
        //         statusCode: 400,
        //         status: false,
        //         message: "Validation Error",
        //         extraDetails: errors,
        //     });
        // } else {
        //     user.password = req.body.password;
        //     user.role = req.body.role;
        //     user.status = req.body.status;
        //     user.updatedAt = req.body.updatedAt;
        //     await user.save();
        //     next({
        //         statusCode: 200,
        //         status: true,
        //         message: "User updated",
        //         data: user,
        //     });
        // }
        
    } catch (error) {
        commonCatchBlock(error, next);
    }
};

const updateLastSeen = async (req, res, next) => {
    try {
        // get the user name from the request
        const userId = req.params.userId;
        // get the user from the database
        const user = await UserModel.findOne({ _id: userId });
        console.log(user, "from updateLastSeen");
        if (!user) {
            next({
                statusCode: 404,
                status: false,
                message: "User not found",
            });
        }
        user.updatedAt = req.body.lastSeen;
        await user.save();
        next({
            statusCode: 200,
            status: true,
            message: "User last seen updated",
            data: user,
        });
    }
    catch (error) {
        commonCatchBlock(error, next);
    }
};


const deleteUser = async (req, res, next) => {
    try {
        // get the user name from the request
        const userId = req.params.userId;
        // delete the user from the database
        const deletedUser = await UserModel.findOneAndDelete({ _id: userId });
        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        
        next({
            statusCode: 200,
            status: true,
            message: "User deleted",
            data: deletedUser,
        });     
    } catch (error) {
        commonCatchBlock(error, next);
    }
};


module.exports = { 
    getAllUsers, 
    getUser,
    updateUser,
    deleteUser,
    updateLastSeen,
};
