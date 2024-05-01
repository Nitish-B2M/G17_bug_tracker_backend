// Create a notification for a new issue
const assignIssueNotification = (issueTitle, sender, assignedUserId) => {
    return{
        notification_title: 'You are assigned to a new issue: ' + issueTitle,
        notification_description: 'You have been assigned an issue: ' + issueTitle + ' by ' + sender.username,
        notification_type: 'assigned',
        notification_status: 'unread',
        notification_from: sender._id,
        notification_to: assignedUserId
    };
}

// Create a notification for a new comment
const commentNotification = (issue, sender, receiver) => {
    return{
        notification_title: 'New comment on issue: ' + issue.title,
        notification_description: sender.username + ' commented on issue: ' + issue.title,
        notification_type: 'commented',
        notification_status: 'unread',
        notification_from: sender._id,
        notification_to: receiver._id
    };
}

// Create a notification for a status changed
const statusChangedNotification = (issue, sender, receiver) => {
    return{
        notification_title: 'Status changed on issue: ' + issue.title,
        notification_description: sender.username + ' changed the status on issue: ' + issue.title,
        notification_type: 'status changed',
        notification_status: 'unread',
        notification_from: sender._id,
        notification_to: receiver._id
    };
}

// Create a notification for a priority changed
const priorityChangedNotification = (issue, sender, receiver) => {
    return{
        notification_title: 'Priority changed on issue: ' + issue.title,
        notification_description: sender.username + ' changed the priority on issue: ' + issue.title,
        notification_type: 'priority changed',
        notification_status: 'unread',
        notification_from: sender._id,
        notification_to: receiver._id
    };
}

// Create a notification for a deleted issue
const deletedIssueNotification = (issue, sender, receiver) => {
    return{
        notification_title: 'Issue deleted: ' + issue.title,
        notification_description: sender.username + ' deleted issue: ' + issue.title,
        notification_type: 'deleted',
        notification_status: 'unread',
        notification_from: sender._id,
        notification_to: receiver._id
    };
}

// Create a notification for a new issue
const issueNotification = (issue, sender, assignedUser) => {
    return{
        notification_title: 'New issue created: ' + issue.title,
        notification_description: 'New issue: ' + issue.title + ' has been created by ' + sender.username,
        notification_type: 'create',
        notification_status: 'unread',
        notification_from: sender._id,
        notification_to: assignedUser._id
    };
}

// Create a notification for a project assigned
const projectAssignedNotification = (project, sender, receiver) => {
    return{
        notification_title: 'You are assigned to a new project: ' + project.project_name,
        notification_description: 'You have been assigned a project: ' + project.project_name + ' by ' + sender.username,
        notification_type: 'assigned',
        notification_status: 'unread',
        notification_from: sender._id,
        notification_to: receiver._id
    };
}

// export the functions
module.exports = {
    assignIssueNotification,
    commentNotification,
    statusChangedNotification,
    priorityChangedNotification,
    deletedIssueNotification,
    issueNotification,
    projectAssignedNotification
};