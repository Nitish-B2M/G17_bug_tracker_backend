const Notification = require('../models/notification-model');
const User = require('../models/user-model');
// const { validationResult } = require('express-validator');
// const { errorMessage, successMessage } = require('../utils/message-template');
// const { sendNotification } = require('../utils/send-notification');
const { commonSuccess, commonItemCreated, commonItemNotFound, commonCatchBlock, commonBadRequest, commonUnauthorizedCall } = require('../common/commonStatusCode');
const commonConsole = require('../common/commonConsole');

// get all notifications
const getAllNotifications = async (req, res, next) => {
    try {
        const userId = req.params.userid;
        const notifications = await Notification.find({ $or: [{ notification_to: userId }], isDeleted: false }).sort({ createdAt: -1 });
        if (!notifications) {
            next(commonItemNotFound(res));
        }
        next(commonSuccess("Notifications fetched successfully", notifications));
    } catch (err) {
        next(commonCatchBlock("Error while fetching notifications", err));
    }
};

const updateNotificationStatus = async (req, res, next) => {
    try {
        const userId = req.params.userid;
        const notifications = await Notification.find({ notification_to: userId, notification_status: 'unread' });
        if (!notifications) {
            next(commonItemNotFound(res));
        }
        await Notification.updateMany({ notification_to: userId, notification_status: 'unread' }, { notification_status: 'read' });
        const printNotifications = await Notification.find({ 
            notification_to: userId, isDeleted: false
        });
        commonConsole("Notifications updated successfully", printNotifications);
        next(commonSuccess("Notifications updated successfully", notifications));
    } catch (err) {
        next(commonCatchBlock("Error while updating notifications", err));
    }
}


// get notification by id
const getNotificationById = async (req, res, next) => {
    try {
        const notification = await Notification.findById(req.params.notificationid);
        if (!notification) {
            next(commonItemNotFound(res));
        }
        next(commonSuccess("Notification fetched successfully", notification));
    } catch (err) {
        next(commonCatchBlock("Error while fetching notification", err));
    }
};

// update notification
const updateNotification = async (req, res, next) => {
    try {
        console.log(req.body, "notification update hook");
        const notification = await Notification.findById(req.params.notificationid);
        if (!notification) {
            next(commonItemNotFound(res));
        }
        notification.notification_status = req.body.notification_status;
        await notification.save();
        next(commonSuccess("Notification updated successfully", notification));
    } catch (err) {
        next(commonCatchBlock("Error while updating notification", err));
    }
};

// delete notification
const deleteNotification = async (req, res, next) => {
    try {
        const notification = await Notification.findById(req.params.notificationid);
        if (!notification) {
            next(commonItemNotFound(res));
        }
        notification.isDeleted = true;
        await notification.save();
        next(commonSuccess("Notification deleted successfully", notification));
    } catch (err) {
        next(commonCatchBlock("Error while deleting notification", err));
    }
};

module.exports = {
    getAllNotifications,
    getNotificationById,
    updateNotification,
    deleteNotification,
    updateNotificationStatus
};

