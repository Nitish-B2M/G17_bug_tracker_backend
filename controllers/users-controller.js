const UserModel = require('../models/user-model');
const { commonCatchBlock, commonSuccess, commonItemNotFound, commonItemCreated } = require('../common/commonStatusCode');
const commonConsole = require('../common/commonConsole');

const getAllUsers = async (req, res, next) => {
    try {
        // get all users from the database
        const users = await UserModel.find({});
        
        commonConsole(users, "All users :/users-controller.js [getAllUsers] 10");
        next(commonSuccess("All users", users));
    } catch (error) {
        next(commonCatchBlock(error));
    }
};

const getUser = async (req, res, next) => {
    try {
        // get the user name from the request
        const userId = req.params.userId;

        UserModel.findOne({ _id: userId }).then((user) => {
            if (!user) {
                next(commonItemNotFound("User not found"));
            }
            next(commonSuccess("User found", user));
        }).catch((error) => {
            next(commonCatchBlock(error));
        });

    } catch (error) {
        next(commonCatchBlock(error));
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
            next(commonItemNotFound("User not found"));
        }
        // first check is username is send in the request
        if (req.body.updatedAt !== undefined) {
            user.updatedAt = req.body.updatedAt;
        }
        await user.save();
        next(commonSuccess("User updated", user));
        
    } catch (error) {
        next(commonCatchBlock(error));
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
            next(commonItemNotFound("User not found"));
        }
        user.updatedAt = req.body.lastSeen;
        await user.save();
        next(commonSuccess("User last seen updated", user));
    }
    catch (error) {
        next(commonCatchBlock(error));
    }
};


const deleteUser = async (req, res, next) => {
    try {
        // get the user name from the request
        const userId = req.params.userId;
        // delete the user from the database
        const deletedUser = await UserModel.findOneAndDelete({ _id: userId });
        if (!deletedUser) {
            next(commonItemNotFound("User not found"));
        }
        
        next(commonSuccess("User deleted", deletedUser));

    } catch (error) {
        next(commonCatchBlock(error));
    }
};

// GET all users by role
const getUsersByRole = async (req, res, next) => {
    try {
        const role = req.params.role;
        var roles = role.split("-");
        var users = [];
        for (let i = 0; i < roles.length; i++) {
            const user = await UserModel.find({ role: roles[i] });
            users = users.concat(user);
        }
        commonConsole(users, "All users by role :/users-controller.js [getUsersByRole] 100");
        next(commonSuccess("All users by role", users));
    } catch (error) {
        next(commonCatchBlock(error));
    }
};


module.exports = { 
    getAllUsers, 
    getUser,
    updateUser,
    deleteUser,
    updateLastSeen,
    getUsersByRole
};
