const express = require('express');
const router = express.Router();
const Notification = require('../controllers/notification-controller');

// get all notifications
router.get('/user/:userid', Notification.getAllNotifications);

// Update notification status for user
router.put('/user/:userid', Notification.updateNotificationStatus);

// get notification by id
router.get('/:notificationid', Notification.getNotificationById);

// update notification
router.put('/:notificationid', Notification.updateNotification);

// delete notification
router.delete('/:notificationid', Notification.deleteNotification);

module.exports = router;