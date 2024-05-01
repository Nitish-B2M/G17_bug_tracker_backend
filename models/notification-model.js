const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Notification = new Schema({
    notification_title: {
        type: String,
        required: true
    },
    notification_description: {
        type: String,
        required: true
    },
    notification_date: {
        type: Date,
        default: Date.now
    },
    notification_status: {
        type: String,
        enum: ['unread', 'read']
    },
    notification_type: {
        type: String,
        enum: ['assigned', 'commented', 'status changed', 'priority changed', 'deleted', 'create']
    },
    notification_from: {
        type: String,
        required: true,
        ref: 'User'
    },
    notification_to: {
        type: String,
        required: true,
        ref: 'User'
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true}
,{ collection: 'notifications'});

module.exports = mongoose.model('Notification', Notification);