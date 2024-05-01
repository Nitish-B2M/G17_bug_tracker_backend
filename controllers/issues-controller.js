const UserModel = require('../models/user-model');
const File = require('../models/file-model');
const Project = require('../models/project-model');
const Issue = require('../models/issue-model');
const IssueTracker = require('../models/issue-tracker-model');
const PublicIssue = require('../models/public-issue-model');
const ProjectUserModel = require('../models/project-user-model');
const Notification = require('../models/notification-model');
const PrModel = require('../models/pr-model');
const { commonSuccess, commonItemCreated, commonItemNotFound, commonCatchBlock, commonBadRequest, commonUnauthorizedCall } = require('../common/commonStatusCode');
const commonConsole = require('../common/commonConsole');
const transporter = require('../common/emailConfigurationSetup');
const Comments = require('../models/comment-model');
const { assignIssueNotification } = require('../common/commonNotification');

// GET all issues
const getAllIssues = async (req, res, next) => {
    try {
        const issues = await Issue.find({ isDeleted: false, visibility: "private" }).populate({
            path: 'created_by',
            select: 'username email'
        }).populate({
            path: 'project_id',
            select: 'title'
            // sort by last updated
        }).sort({ updatedAt: -1 });

        commonConsole(issues, "from getAllIssues /path:issue-controller.js [getAllIssues] 26");
        next(commonSuccess("All issues", issues));
    } catch (error) {
        next(commonCatchBlock(error));
    }
};

// GET a single issue
const getIssue = async (req, res, next) => {
    try {
        const issueId = req.params.issueId;
        const checkFirstIssue = await Issue.findOne({ _id: issueId, isDeleted: false, visibility: "private" });

        if (!checkFirstIssue) {
            next(commonItemNotFound("Issue not found"));
        }

        const issue = await Issue.findById(issueId).populate({
            path: 'created_by',
            select: 'username email'
        }).populate({
            path: 'project_id',
            select: 'title'
        });
        // also populate last updated by if not null
        const lastUpdatedBy = issue.last_updated_by;
        if (lastUpdatedBy) {
            const issueWithLastUpdatedBy = await Issue.findById(issueId).populate({
                path: 'created_by',
                select: 'username email'
            }).populate({
                path: 'project_id',
                select: 'title'
            }).populate({
                path: 'last_updated_by',
                select: 'username email'
            });

            commonConsole(issueWithLastUpdatedBy, "from getIssue /path:issue-controller.js [getIssue] 59");
        }

        if (!issue) {
            next(commonItemNotFound("Issue not found"));
        }
        next(commonSuccess("Issue found", issue));

    } catch (error) {
        next(commonCatchBlock(error));
    }
};

// type cast string to enum
function typeCast(status, enumArray) {
    for (var i = 0; i < enumArray.length; i++) {
        if (status === enumArray[i]) {
            return enumArray[i];
        }
    }
}

// POST a new issue
const createIssue = async (req, res, next) => {
    // work on this function
    try {
        const issue = await Issue.findOne({ title: req.body.title, project_id: req.body.project_id });
        if (issue) {
            commonConsole(issue, "from createIssue /path:issue-controller.js [createIssue] 119");
            next(commonBadRequest("Issue for this project already exists"));
        } else {
            // type cast status to enum
            var status = req.body.status;
            var enumStatus = ['open', 'in-progress', 'resolved', 'on-hold'];
            var typeCastStatus = typeCast(status, enumStatus);
            // type cast priority to enum
            var priority = req.body.priority;
            var enumPriority = ['blocker', 'critical', 'major', 'minor'];
            var typeCastPriority = typeCast(priority, enumPriority);
            // type cast visibility to enum
            var visibility = req.body.visibility;
            var enumVisibility = ['public', 'private'];
            var typeCastVisibility = typeCast(visibility, enumVisibility);
            // type cast feature to enum
            var feature = req.body.feature;
            var enumFeature = ['bug', 'defect', 'enhancement'];
            var typeCastFeature = typeCast(feature, enumFeature);

            const issue = {
                title: req.body.title,
                description: req.body.description,
                project_id: req.body.project_id,
                created_by: req.body.created_by,
                status: typeCastStatus,
                priority: typeCastPriority,
                visibility: typeCastVisibility,
                feature: typeCastFeature,
                due_date: req.body.due_date,
                last_updated_by: req.body.last_updated_by
            }
            const newIssue = await Issue.create(issue);
            await newIssue.save();

            var reciever = await UserModel.findOne({ _id: req.body.created_by });
            reciever.email = reciever.email;
            if (reciever.email === "nitish@gmail.com" || reciever.email === "developer@gmail.com" || reciever.email === "user@gmail.com" || reciever.email === "nitish-user@gmail.com"){
                reciever.email = "dump.yard.area@gmail.com";
            }


            transporter.sendMail({
                from: "nitishxsharma08@gmail.com",
                to: reciever.email,
                subject: 'New issue created:' + issue.title,
                html: `<!DOCTYPE html>
                <html>
                  <body>
                    <p>Dear user,</p>
                    <p>You have created an issue:<b> ${issue.title}</b><br>Project: ${issue.project_id}<br>Created by: ${issue.created_by}<br>Description: ${issue.description}<br>Priority: ${issue.priority}<br>Due Date: ${issue.due_date}<br>Feature: ${issue.feature}<br>Visibility: ${issue.visibility}</p>
                    <p>Click <a href="http://localhost:3000/issue/${newIssue._id}">here</a> to view the issue.</p>
                    <p>Regards,<br>BugTracker Team</p>

                    <p>For any queries, contact us at: <a href="mailto:nitishxsharma08@gmail.com">nitishxsharma08@gmail.com</a></p>
                  </body>
                </html>
                `
            }, (error, info) => {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });

            if (!newIssue) {
                next(commonItemNotFound("Issue not found"));
            }
            const file = req.files;
            if (file) {
                issue.files = [];
                for (let i = 0; i < file.length; i++) {
                    const newFile = await File.create({
                        filename: file[i].filename,
                        path: file[i].path,
                        collection_Type: 'issue',
                        collection_id: newIssue._id,
                        created_by: req.body.created_by
                    });
                    var tempFileObject = { [file[i].filename]: file[i].path }
                    issue.files.push(tempFileObject);
                    await newFile.save();
                }
                commonConsole(newIssue, "from createIssue /path:issue-controller.js [createIssue] 179 143");
                await next(commonItemCreated("Issue created successfully", newIssue));
            }

            commonConsole(newIssue, "from createIssue /path:issue-controller.js [createIssue] 187 146");
            await next(commonItemCreated("Issue created successfully", newIssue));
        }
    }
    catch (error) {
        next(commonCatchBlock(error));
    }

};

// PUT update an issue
const updateIssue = async (req, res, next) => {
    try {
        const issueId = req.params.issueId;
        const issue = await Issue.findOne({ _id: issueId, isDeleted: false});

        if (!issue) {
            next(commonItemNotFound("Issue not found"));
        }
        if (req.body.title) { issue.title = req.body.title; }
        if (req.body.description) { issue.description = req.body.description; }
        if (req.body.project_id) { issue.project_id = req.body.project_id; }
        if (req.body.created_by) { issue.created_by = req.body.created_by; }
        if (req.body.status) {
            var status = req.body.status;
            var enumStatus = ['open', 'in-progress', 'resolved', 'on-hold'];
            var typeCastStatus = typeCast(status, enumStatus);
            issue.status = typeCastStatus;
        }
        if (req.body.priority) {
            var priority = req.body.priority;
            var enumPriority = ['blocker', 'critical', 'major', 'minor'];
            var typeCastPriority = typeCast(priority, enumPriority);
            issue.priority = typeCastPriority;
        }
        if (req.body.visibility) { issue.visibility = req.body.visibility; }
        if (req.body.feature) { issue.feature = req.body.feature; }
        if (req.body.due_date) { issue.due_date = req.body.due_date; }

        if (req.body.last_updated_by) {
            const user = await UserModel.findOne({ _id: req.body.last_updated_by });
            if (!user) {
                next(commonItemNotFound("User not found"));
            }
            issue.last_updated_by = req.body.last_updated_by;
        }
        await issue.save();

        const issueWithLastUpdatedBy = await Issue.findById(issueId).populate({
            path: 'created_by',
            select: 'username email'
        }).populate({
            path: 'project_id',
            select: 'title'
        }).populate({
            path: 'last_updated_by',
            select: 'username email'
        });

        console.log(issueWithLastUpdatedBy, "from updateIssue /path:issue-controller.js [updateIssue] 220 274");
        next(commonSuccess("Issue updated", issueWithLastUpdatedBy));

        // Send email to created by user
        const reciever = await UserModel.findOne({ _id: issue.last_updated_by });
        if (reciever.email === "nitish@gmail.com" || reciever.email === "developer@gmail.com" || reciever.email === "user@gmail.com"){
            reciever.email = "dump.yard.area@gmail.com";
        }

        transporter.sendMail({
            from: "nitishxsharma08@gmail.com",
            to: reciever.email,
            subject: 'Update on issue' + issue.title,
            html: `<!DOCTYPE html>
            <html>
              <body>
                <p>Dear user,</p>
                <p>You have an update on issue: <b>${issue.title}</b><br>Project: ${issueWithLastUpdatedBy?.title}<br>Created by: ${issueWithLastUpdatedBy?.created_by?.username}[${issueWithLastUpdatedBy?.created_by.email}]<br>Updated by: ${issueWithLastUpdatedBy?.last_updated_by?.username}[${issueWithLastUpdatedBy?.last_updated_by?.email}]<br>Description: ${issue.description}<br>Priority: ${issue.priority}<br>Due Date: ${issue.due_date}<br>Feature: ${issue.feature}<br>Visibility: ${issue.visibility}</p>
                <p>Click <a href="http://localhost:3000/issue/${issueId}">here</a> to view the issue.</p>
                <p>Regards,<br>BugTracker Team</p>

                <p>For any queries, contact us at: <a href="mailto:nitishxsharma08@gmail.com">nitishxsharma08@gmail.com</a></p>
              </body>
            </html>
            `,
        }, (error, info) => {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

    } catch (error) {
        next(commonCatchBlock(error));
    }
};

// DELETE an issue
const deleteIssue = async (req, res, next) => {
    try {
        const issueId = req.params.issueId;
        const issue = await Issue.findOne({ _id: issueId });
        if (!issue) {
            next(commonItemNotFound("Issue not found"));
        }
        await Issue.findOneAndUpdate({ _id: issueId }, { isDeleted: true });
        // delete all comments
        await Comments.updateMany({ issue_id: issueId }, { $set: { isDeleted: true } });
        // delete all issue trackers
        await IssueTracker.updateMany({ issue_id: issueId }, { $set: { isDeleted: true } });
        
        commonConsole(issue, "from deleteIssue /path:issue-controller.js [deleteIssue] 274");
        next(commonSuccess("Issue deleted Successfully"));
    } catch (error) {
        next(commonCatchBlock(error));
    }
};

// POST a new comment to an issue
const addComment = async (req, res, next) => {
    try {
        const issueId = req.params.issueId;
        const comment = req.body.comment;
        const created_by = req.body.commentedBy;
        // check if issue exists
        const issue = await Issue.findOne({ _id: issueId, isDeleted: false});
        if (!issue) {
            next(commonItemNotFound("Issue not found"));
        }
        const newComment = {
            issue_id: issueId,
            description: comment,
            created_by: created_by
        }
        // if parent id is not null
        if (req.body.parentId) {
            newComment.parent_id = req.body.parentId;
        }
        const commentObject = await Comments.create(newComment);
        await commentObject.save();

        if (!commentObject) {
            next(commonItemNotFound("Comment not added"));
        }
        // get user details
        const commentObject2 = await Comments.findById(commentObject._id).populate({
            path: 'created_by',
            select: 'username email'
        });
        commonConsole(commentObject2, "from addComment /path:issue-controller.js [addComment] 298");
        next(commonItemCreated("Comment added successfully", commentObject2));
    } catch (error) {
        next(commonCatchBlock(error));
    }
};

// GET all comments by issue
const getCommentsOnIssue = async (req, res, next) => {
    try {
        const issueId = req.params.issueId;
        const issue = await Issue.findOne({ _id: issueId, isDeleted: false});
        if (!issue) {
            next(commonItemNotFound("Issue not found"));
        }
        const comments = await Comments.find({ issue_id: issueId, isDeleted: false }).populate({
            path: 'created_by',
            select: 'username email'
        }).populate({
            path: 'issue_id',
            select: 'title'
        }).sort({ updatedAt: -1 });
        commonConsole(comments, "from getCommentsOnIssue /path:issue-controller.js [getCommentsOnIssue] 348");
        next(commonSuccess("All comments by issue", comments));
    } catch (error) {
        next(commonCatchBlock(error));
    }
}

// UPDATE a comment by issue
const updateCommentIssue = async (req, res, next) => {
    try {
        const issueId = req.params.issueId;
        const commentId = req.params.commentId;
        const issue = await Issue.findOne({ _id: issueId, isDeleted: false});
        if (!issue) {
            next(commonItemNotFound("Issue not found"));
        }
        const comment = await Comments.findOne({ _id: commentId });
        if (!comment) {
            next(commonItemNotFound("Comment not found"));
        }
        if (req.body.comment) { comment.description = req.body.comment; }
        if (req.body.commentedBy) { comment.created_by = req.body.commentedBy; }
        if (req.params.issueId) { comment.issue_id = req.params.issueId; }
        if (req.body.parent_id) { comment.parent_id = req.body.parent_id; }
        await comment.save();
        const comment2 = await Comments.findById(comment._id).populate({
            path: 'created_by',
            select: 'username email'
        });
        commonConsole(comment2, "from updateCommentIssue /path:issue-controller.js [updateCommentIssue] 356");
        next(commonSuccess("Comment updated", comment2));
    } catch (error) {
        next(commonCatchBlock(error));
    }
}

// DELETE a comment by issue
const deleteCommentIssue = async (req, res, next) => {
    try {
        const issueId = req.params.issueId;
        const commentId = req.params.commentId;
        const issue = await Issue.findOne({ _id: issueId });
        if (!issue) {
            next(commonItemNotFound("Issue not found"));
        }
        const comment = await Comments.findOne({ _id: commentId });
        if (!comment) {
            next(commonItemNotFound("Comment not found"));
        }

        // check if comment is present in other comments as parent id
        const comments = await Comments.find({ parent_id: commentId });
        if (comments.length > 0) {
            for (var i = 0; i < comments.length; i++) {
                await Comments.findOneAndUpdate({ _id: comments[i]._id }, { isDeleted: true });
            }
        }
        await Comments.findOneAndUpdate({ _id: commentId }, { isDeleted: true });

        const comments2 = await Comments.find({ issue_id: issueId, isDeleted: false }).populate({
            path: 'created_by',
            select: 'username email'
        }).populate({
            path: 'issue_id',
            select: 'title'
        }).sort({ updatedAt: -1 });
        
        next(commonSuccess("Comment deleted Successfully", comments2));
    } catch (error) {
        next(commonCatchBlock(error));
    }
}

// GET all issues by project
const getIssuesByProject = async (req, res, next) => {
    try {
        const projectId = req.params.projectId;
        const project = await Project.findOne({ _id: projectId, isDeleted: false });
        if (!project) {
            next(commonItemNotFound("Project not found"));
        }
        const issues = await Issue.find({ project_id: projectId, isDeleted: false})
            .populate({
                path: 'created_by',
                select: 'username email'
            }).populate({
                path: 'project_id',
                select: 'title'
            }).sort({ updatedAt: -1 });
        commonConsole(issues, "from getIssuesByProject /path:issue-controller.js [getIssuesByProject] 318");
        next(commonSuccess("All issues by project", issues));
    } catch (error) {
        next(commonCatchBlock(error));
    }
};

// issue tracker
const getIssueTracker = async (req, res, next) => {
    try {
        const issueTracker = await IssueTracker.find({ isDeleted: false });
        if (!issueTracker) {
            next(commonItemNotFound("Issue tracker not found"));
        }
        // get comments
        const responseIssueTracker = [];
        for (var i = 0; i < issueTracker.length; i++) {
            const comments = await Comments.find({ issue_id: issueTracker[i]._id, created_by: issueTracker[i].assigned_by }).sort({ updatedAt: -1 });
            const temp = {
                _id: issueTracker[i]._id,
                issue_id: issueTracker[i].issue_id,
                assigned_by: issueTracker[i].assigned_by,
                assigned_to: issueTracker[i].assigned_to,
                status: issueTracker[i].status,
                comment: comments[0].description,
                isDeleted: issueTracker[i].isDeleted,
                createdAt: issueTracker[i].createdAt,
                updatedAt: issueTracker[i].updatedAt,
            }
            responseIssueTracker.push(temp);
        }
        commonConsole(responseIssueTracker, "/path:issue-controller.js [getIssueTracker] 467");
        next(commonSuccess("All issue trackers", responseIssueTracker));
    } catch (error) {
        next(commonCatchBlock(error));
    }
};

// get issue tracker by id -- to-do: working left
const getIssueTrackerId = async (req, res, next) => {
    try {
        const issue_id = req.params.issuetrackerid;
        const issueTracker = await IssueTracker.find({ issue_id: issue_id, isDeleted: false }).populate({
            path: 'issue_id',
            select: 'title description'
        }).populate({
            path: 'assigned_to',
            select: 'username email'
        });
        if (!issueTracker) {
            next(commonItemNotFound("Issue tracker not found"));
        }
        // also get comments
        const responseIssueTracker = [];
        for (var i = 0; i < issueTracker.length; i++) {
            const comments = await Comments.find({ issue_id: issueTracker[i]._id, created_by: issueTracker[i].assigned_by }).sort({ updatedAt: -1 });
            const temp = {
                _id: issueTracker[i]._id,
                issue_id: issueTracker[i].issue_id,
                assigned_by: issueTracker[i].assigned_by,
                assigned_to: issueTracker[i].assigned_to,
                status: issueTracker[i].status,
                comment: comments[0].description,
                isDeleted: issueTracker[i].isDeleted,
                createdAt: issueTracker[i].createdAt,
                updatedAt: issueTracker[i].updatedAt,
            }
            responseIssueTracker.push(temp);
        }

        commonConsole(responseIssueTracker, "from getIssueTrackerId /path:issue-controller.js [getIssueTrackerId] 507");
        next(commonSuccess("Issue tracker found", responseIssueTracker));
    } catch (error) {
        next(commonCatchBlock(error));
    }
};

// create issue tracker
const createIssueTracker = async (req, res, next) => {
    try {
        // type cast status to enum
        var status = req.body.assignStatus;
        var enumStatus = ['open', 'in-progress', 'resolved', 'on-hold'];
        var typeCastStatus = typeCast(status, enumStatus);

        const issueTracker = {
            issue_id: req.body.assignIssueId,
            assigned_by: req.body.assignedBy,
            assigned_to: req.body.assignTo,
            status: typeCastStatus
        }

        if (issueTracker.issue_id === null || issueTracker.issue_id === undefined || issueTracker.issue_id === "" || issueTracker.issue_id === "undefined") {
            next(commonItemNotFound("Issue not found"));
        }

        // also check if user already assigned to issue
        const checkIssueTracker = await IssueTracker.findOne({ issue_id: issueTracker.issue_id, assigned_to: issueTracker.assigned_to, isDeleted: false});
        if (checkIssueTracker) {
            commonConsole(checkIssueTracker.length, "User already assigned to issue from /path:issue-controller.js [createIssueTracker] 340");
            next(commonBadRequest("User already assigned to issue"));
        } else {
        
        const newIssueTracker = await IssueTracker.create(issueTracker);
        await newIssueTracker.save();
        const trackerComment = {
            issue_id: newIssueTracker._id,
            description: req.body.assignDescription,
            created_by: newIssueTracker.assigned_by
        }
        const newComment = await Comments.create(trackerComment);
        await newComment.save();
        if (!newComment) {
            next(commonItemNotFound("Comment not added"));
        }
        if (!newIssueTracker) {
            next(commonItemNotFound("Issue tracker not found"));
        }
        // populate user and issue
        const resIssueTracker = await IssueTracker.findById(newIssueTracker._id).populate({
            path: 'issue_id',
            select: 'title description'
        }).populate({
            path: 'assigned_to',
            select: 'username email'
        });

        // get comment
        const responseComment = await Comments.find({ issue_id: resIssueTracker._id, created_by: resIssueTracker.assigned_by }).sort({ updatedAt: -1 });
        const responseIssueTracker = {
            _id: resIssueTracker._id,
            issue_id: resIssueTracker.issue_id,
            assigned_by: resIssueTracker.assigned_by,
            assigned_to: resIssueTracker.assigned_to,
            status: resIssueTracker.status,
            comment: responseComment[0].description,
            isDeleted: resIssueTracker.isDeleted,
            createdAt: resIssueTracker.createdAt,
            updatedAt: resIssueTracker.updatedAt,
        }
        commonConsole(responseIssueTracker, "from createIssueTracker /path:issue-controller.js [createIssueTracker] 340 363 423");
        // Send email to assigned user
        const issue = responseIssueTracker.issue_id;
        const assignedUser = responseIssueTracker.assigned_to;
        const assignee = responseIssueTracker.assigned_by;
        const issueStatus = responseIssueTracker.status;
        var sender = await UserModel.findOne({ _id: assignee });
        if (sender.email === "nitish@gmail.com" || sender.email === "developer@gmail.com" || sender.email === "manushi2@gmail.com" || sender.email === "nitish-user@gmail.com"){
            sender.email = "nitishxsharma08@gmail.com";
        }
        if (assignedUser.email === "nitish@gmail.com" || assignedUser.email === "developer@gmail.com" || assignedUser.email === "manushi2@gmail.com" || assignedUser.email === "nitish-user@gmail.com"){
            assignedUser.email = "dump.yard.area@gmail.com";
        }
        transporter.sendMail({
            from: sender.email,
            to: assignedUser.email,
            subject: 'You are assigned to a new issue: ' + issue.title,
            html: `<!DOCTYPE html>
                    <html>
                      <body>
                        <p>Dear ${assignedUser.username},</p>
                        <p>You have been assigned an issue:<br>Title: ${issue.title}<br>Description: ${issue.description}<br>Assigned by: ${sender.username}<br>Comment: ${responseIssueTracker.comment}<br>Status: ${issueStatus}</p>
                        <p>Click <a href="http://localhost:3000/issues/${issue._id}">here</a> to view the issue.</p>
                        <p>Regards,<br>BugTracker Team</p>

                        <p>For any queries, contact us at: <a href="mailto:"${sender.email}">${sender.email}</a></p>
                      </body>
                    </html>`
        }, (error, info) => {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
        const notification = assignIssueNotification(issue.title, sender, assignedUser._id);
        const newNotification = await Notification.create(notification);
        await newNotification.save();    

        const file = req.files;
        // if files are attached not null or undefined or file [] is not empty
        if (file !== null && file !== undefined && file.length > 0) {
            responseIssueTracker.files = [];
            for (let i = 0; i < file.length; i++) {
                const newFile = await File.create({
                    filename: file[i].filename,
                    path: file[i].path,
                    collection_Type: 'issue_tracker',
                    collection_id: newIssueTracker._id,
                    created_by: req.body.assignedBy
                });
                var tempFileObject = { [file[i].filename]: file[i].path }
                responseIssueTracker.files.push(tempFileObject);
                await newFile.save();
            }
            commonConsole(responseIssueTracker, "from createIssueTracker /path:issue-controller.js [createIssueTracker] 340 363 423");
            await next(commonItemCreated("Issue assigned to user with attachment", responseIssueTracker));
        }
        commonConsole(responseIssueTracker, "from createIssueTracker /path:issue-controller.js [createIssueTracker] 340 372 439");
        await next(commonItemCreated("Issue assigned to user", responseIssueTracker));
        }
    }
    catch (error) {
        next(commonCatchBlock(error));
    }
}

// update issue tracker to-do: working left
const updateIssueTrackerId = async (req, res, next) => {
    try {
        const issue_id = req.params.issuetrackerid;
        const issueTracker = await IssueTracker.findOne({ issue_id: issue_id });
        if (!issueTracker) {
            next(commonItemNotFound("Issue tracker not found"));
        }
        const issue = await Issue.findOne({ title: req.body.title });
        if (!issue) {
            next(commonItemNotFound("Issue not found"));
        }
        const user = await UserModel.findOne({ username: req.body.assigned_to });
        if (!user) {
            next(commonItemNotFound("User not found"));
        }
        issueTracker.issue_id = issue._id;
        issueTracker.assigned_to = user._id;
        issueTracker.comment = req.body.comment;
        issueTracker.file_id = req.body.file_id;
        issueTracker.status = req.body.status;
        await issueTracker.save();
        commonConsole(issueTracker, "from updateIssueTrackerId /path:issue-controller.js [updateIssueTrackerId] 485");
        next(commonSuccess("Issue tracker updated", issueTracker));
    } catch (error) {
        next(commonCatchBlock(error));
    }
}

// delete issue tracker to-do: working left
const deleteIssueTracker = async (req, res, next) => {
    try {
        const issue_id = req.params.issuetrackerid;
        const issueTracker = await IssueTracker.findOne({ _id: issue_id });
        if (!issueTracker) {
            next(commonItemNotFound("Issue tracker not found"));
        }
        await IssueTracker.findOneAndUpdate({ _id: issue_id }, { isDeleted: true });
        // delete all comments
        await Comments.updateMany({ issue_id: issue_id }, { $set: { isDeleted: true } });
        // delete all notifications
        await Notification.updateMany({ issue_id: issue_id }, { $set: { isDeleted: true } });
        // return all issue trackers after deleting
        const issueTrackers2 = await IssueTracker.find({ isDeleted: false });
        commonConsole(issueTrackers2, "from deleteIssueTracker /path:issue-controller.js [deleteIssueTracker] 520");
        next(commonSuccess("Issue tracker deleted Successfully", issueTrackers2));
    } catch (error) {
        next(commonCatchBlock(error));
    }
}

// get issue tracker by project id
const getIssueTrackerByProject = async (req, res, next) => {
    try {
        const projectId = req.params.projectId;
        const project = await Project.findOne({ _id: projectId });
        // commonConsole(project, "from getIssueTrackerByProject /path:issue-controller.js [getIssueTrackerByProject] 396");
        if (!project) {
            next(commonItemNotFound("Project not found"));
        }
        const issues = await Issue.find({ project_id: projectId, isDeleted: false});
        if (!issues) {
            next(commonItemNotFound("Issues not found"));
        }
        var issueIds = [];
        for (var i = 0; i < issues.length; i++) {
            issueIds.push(issues[i]._id);
        }
        const issueTracker = await IssueTracker.find({ issue_id: issueIds }).populate({
            path: 'issue_id',
            select: 'title description'
        }).populate({
            path: 'assigned_to',
            select: 'username email'
        });

        // calculate the number of issue tracker on each date
        var dateArray = [];
        var dateCount = [];
        for (var i = 0; i < issueTracker.length; i++) {
            var date = issueTracker[i].createdAt.toDateString();
            if (dateArray.includes(date)) {
                var index = dateArray.indexOf(date);
                dateCount[index] = dateCount[index] + 1;
            } else {
                dateArray.push(date);
                dateCount.push(1);
            }
        }
        var dateObject = {};
        for (var i = 0; i < dateArray.length; i++) {
            // put in format of "mm/dd/yyyy"
            var tempDate = new Date(dateArray[i]);
            var month = tempDate.getMonth() + 1;
            var day = tempDate.getDate();
            var year = tempDate.getFullYear();
            var tempDateString = month + "/" + day + "/" + year;
            dateObject[tempDateString] = dateCount[i];
        }

        if (!issueTracker) {
            next(commonItemNotFound("Issue tracker not found"));
        }
        commonConsole(issueTracker, "from getIssueTrackerByProject /path:issue-controller.js [getIssueTrackerByProject] 704");
        next(commonSuccess("Issue tracker found", issueTracker, dateObject));
    } catch (error) {
        next(commonCatchBlock(error));
    }
}

// get issue tracker by user id
const getIssueTrackerByUser = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        const user = await UserModel.findOne({ _id: userId });
        if (!user) {
            next(commonItemNotFound("User not found"));
        }
        const issueTracker = await IssueTracker.find({ assigned_to: userId, isDeleted: false }).populate({
            path: 'issue_id',
            select: 'title description project_id'
        }).populate({
            path: 'assigned_by',
            select: 'username email'
        }).populate({
            path: 'assigned_to',
            select: 'username email'
        }).sort({ updatedAt: -1 });
        if (!issueTracker) {
            next(commonItemNotFound("Issue tracker not found for user"));
        }
        // get comments
        var responseIssueTracker = [];
        for (var i = 0; i < issueTracker.length; i++) {
            const comments = await Comments.find({ issue_id: issueTracker[i]._id, created_by: issueTracker[i].assigned_by }).sort({ updatedAt: -1 });
            const project = await Project.findOne({ _id: issueTracker[i].issue_id.project_id });
            const temp = {
                _id: issueTracker[i]._id,
                issue_id: issueTracker[i].issue_id,
                assigned_by: issueTracker[i].assigned_by,
                assigned_to: issueTracker[i].assigned_to,
                status: issueTracker[i].status,
                comment: comments[0].description,
                isDeleted: issueTracker[i].isDeleted,
                createdAt: issueTracker[i].createdAt,
                updatedAt: issueTracker[i].updatedAt,
                project: project.title
            }
            responseIssueTracker.push(temp);
        }
        commonConsole(responseIssueTracker, "from getIssueTrackerByUser /path:issue-controller.js [getIssueTrackerByUser] 792");
        next(commonSuccess("Issue tracker found for user", responseIssueTracker));
    } catch (error) {
        next(commonCatchBlock(error));
    }
}

// update issue tracker status
const updateITStatusForUser = async (req, res, next) => {
    try {
        const issueTrackerId = req.params.issuetrackerid;
        const issueTracker = await IssueTracker.findOne({ _id: issueTrackerId });
        if (!issueTracker) {
            next(commonItemNotFound("Issue tracker not found"));
        }
        var status = req.body.status;
        if (status == "resolved") {
            status = "on-hold";
        }
        var enumStatus = ['open', 'in-progress', 'resolved', 'on-hold'];
        var typeCastStatus = typeCast(status, enumStatus);
        issueTracker.status = typeCastStatus;
        await issueTracker.save();

        if(status == "on-hold" || status == "resolved"){
            const issue = await Issue.findOne({ _id: issueTracker.issue_id, isDeleted: false});
            const project = await Project.findOne({ _id: issue.project_id, isDeleted: false});
            const prCheck = await PrModel.findOne({ issuetracker_id: issueTrackerId, issue_id: issue._id, project_id: project._id, user_id: issueTracker.assigned_to });
            if (prCheck) { next(commonBadRequest("PR already exists")); }

            const pr = await PrModel.create({ 
                issuetracker_id: issueTrackerId,
                issue_id: issue._id,
                project_id: project._id,
                user_id: issueTracker.assigned_to,
                creator_id: issueTracker.assigned_by,
                status: "pending",
            });
            await pr.save();
            var currentIssueTrackerId = issueTrackerId;
            const comment = {
                issue_id: pr._id,
                description: req.body.description,
                created_by: req.body.user_id
            }
            const newComment = await Comments.create(comment);
            await newComment.save();
            if (!newComment) {next(commonItemNotFound("Comment not added"));}
            
            const responseIssueTracker = await IssueTracker.findById(currentIssueTrackerId).populate({
                path: 'issue_id',
                select: 'title description'
            }).populate({
                path: 'assigned_to',
                select: 'username email'
            });
            commonConsole(responseIssueTracker, "from updateITStatusForUser /path:issue-controller.js [updateITStatusForUser] 853");
            next(commonSuccess("Issue tracker status updated", responseIssueTracker));
        } else{
            var currentIssueTrackerId = issueTrackerId;
            const comment = {
                issue_id: currentIssueTrackerId,
                description: req.body.description,
                created_by: req.body.user_id
            }
            const newComment = await Comments.create(comment);
            await newComment.save();
            if (!newComment) {next(commonItemNotFound("Comment not added"));}
            
            const responseIssueTracker = await IssueTracker.findById(currentIssueTrackerId).populate({
                path: 'issue_id',
                select: 'title description'
            }).populate({
                path: 'assigned_to',
                select: 'username email'
            });
            commonConsole(responseIssueTracker, "from updateITStatusForUser /path:issue-controller.js [updateITStatusForUser] 853");
            next(commonSuccess("Issue tracker status updated", responseIssueTracker));
        }
        
    } catch (error) {
        next(commonCatchBlock(error));
    }
}

// get issue tracker review by user
const getIssueTrackerReviewForUser = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        const user = await UserModel.findOne({ _id: userId });
        if (!user) { next(commonItemNotFound("User not found")); }
        const pr = await PrModel.find({ creator_id: userId}).populate({
            path: 'issuetracker_id',
            select: 'issue_id assigned_by assigned_to status'
        }).populate({
            path: 'issue_id',
            select: 'title description'
        }).populate({
            path: 'project_id',
            select: 'title'
        }).populate({
            path: 'user_id',
            select: 'username email'
        }).populate({
            path: 'creator_id',
            select: 'username email'
        }).sort({ updatedAt: -1 });
        if (!pr) { next(commonItemNotFound("PR not found")); }
        commonConsole(pr, "from getIssueTrackerReviewForUser /path:issue-controller.js [getIssueTrackerReviewForUser] 879");
        next(commonSuccess("PR found for user", pr));
    } catch (error) {
        next(commonCatchBlock(error));
    }
}

// GET a single public issue
const getPublicIssue = async (req, res, next) => {
    try {
        const publicIssueId = req.params.publicIssueId;

        PublicIssue.findOne({ _id: publicIssueId }).populate({
            path: 'created_by',
            select: 'username email'
        }).then((publicIssue) => {
            if (!publicIssue) {
                next(commonItemNotFound("Public Issue not found"));
            }
            next(commonSuccess("Public Issue found", publicIssue));
        }).catch((error) => {
            next(commonCatchBlock(error));
        });
    } catch (error) {
        next(commonCatchBlock(error));
    }
}

// POST a new public issue
const createPublicIssue = async (req, res, next) => {
    try {
        const checkIssue = await PublicIssue.findOne({ title: req.body.title, created_by: req.body.created_by});

        if (checkIssue) {
            commonConsole(checkIssue, "from createPublicIssue /path:issue-controller.js [createPublicIssue] 119");
            next(commonBadRequest("Issue already exists"));
            return;
        }   
        // type cast status to enum
        var status = req.body.status;
        var enumStatus = ['blocker', 'critical', 'major', 'minor'];
        var typeCastStatus = typeCast(status, enumStatus);
        // type cast feature to enum
        var feature = req.body.feature;
        var enumFeature = ['bug', 'defect', 'enhancement'];
        var typeCastFeature = typeCast(feature, enumFeature);

        const publicIssue = {
            title: req.body.title,
            description: req.body.description,
            created_by: req.body.created_by,
            status: typeCastStatus,
            feature: typeCastFeature
        }
        const newPublicIssue = await PublicIssue.create(publicIssue);
        await newPublicIssue.save();
        // const newPublicIssue = false;
        if (!newPublicIssue) {
            next(commonItemNotFound("Issue not found"));
        }
        const file = req.files;
        // if (file) {
        //     publicIssue.files = [];
        //     for (let i = 0; i < file.length; i++) {
        //         const newFile = await File.create({
        //             filename: file[i].filename,
        //             path: file[i].path,
        //             collection_Type: 'issue',
        //             collection_id: newIssue._id,
        //             created_by: req.body.created_by
        //         });
        //         var tempFileObject = {[file[i].filename]: file[i].path}
        //         publicIssue.files.push(tempFileObject);
        //         await newFile.save();
        //     }
        //     commonConsole(newPublicIssue, "from createPublicIssue /path:issue-controller.js [createPublicIssue] 572");
        //     await next(commonItemCreated("Issue created successfully", newPublicIssue));
        // }
        commonConsole(newPublicIssue, "from createPublicIssue /path:issue-controller.js [createPublicIssue] 575");
        await next(commonItemCreated("Issue created successfully", newPublicIssue));
    }
    catch (error) {
        next(commonCatchBlock(error));
    }
}

const getIssuesByUser = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        // get user role
        const user = await UserModel.findOne({ _id: userId });
        if (!user) {
            next(commonItemNotFound("User not found"));
        }
        var projects = [];
        if (user.role === 'admin') {
            const issues = await Issue.find({ isDeleted: false, visibility: "private" }).populate({
                path: 'created_by',
                select: 'username email'
            }).populate({
                path: 'project_id',
                select: 'title'
            }).sort({ updatedAt: -1 });
            commonConsole(issues, "from getIssuesByUser /path:issue-controller.js [getIssuesByUser] 621");
            next(commonSuccess("All issues by user", issues));
        } else {
            projects = await ProjectUserModel.find({ userId: userId, isDeleted: false });
            if (!projects) {
                next(commonItemNotFound("Project not assigned to you"));
            }
            var projectIds = [];
            for (var i = 0; i < projects.length; i++) {
                projectIds.push(projects[i].projectId);
            }
            const issues = await Issue.find({ project_id: projectIds, isDeleted: false, visibility: "private" }).populate({
                path: 'created_by',
                select: 'username email'
            }).populate({
                path: 'project_id',
                select: 'title'
            }).sort({ updatedAt: -1 });
            commonConsole(issues, "from getIssuesByUser /path:issue-controller.js [getIssuesByUser] 621");
            next(commonSuccess("All issues by user", issues));
        }
    }
    catch (error) {
        next(commonCatchBlock(error));
    }
}

const getUsersToAssign = async (req, res, next) => {
    try {
        const issueId = req.params.issueId;
        const issue = await Issue.findOne({ _id: issueId, isDeleted: false, visibility: "private"});
        if (!issue) {
            next(commonItemNotFound("Issue not found"));
        }
        // get project for issue
        const project = await Project.findOne({ _id: issue.project_id, isDeleted: false});
        if (!project) {
            next(commonItemNotFound("Project not found"));
        }
        // get users assigned to project
        const projectUsers = await ProjectUserModel.find({ projectId: project._id, isDeleted: false});
        if (!projectUsers) {
            next(commonItemNotFound("Users not found"));
        }
        // get all users
        const users = await UserModel.find({ isDeleted: false}, { username: 1, email: 1, role: 1, _id: 1});
        if (!users) {
            next(commonItemNotFound("Users not found"));
        }
        var usersToAssign = [];
        for (var i = 0; i < users.length; i++) {
            for (var j = 0; j < projectUsers.length; j++) {
                if (users[i]._id.toString() === projectUsers[j].userId.toString()) {
                    usersToAssign.push(users[i]);
                }
            }
        }
        // commonConsole(usersToAssign, "from getUsersToAssign /path:issue-controller.js [getUsersToAssign] 834");
        next(commonSuccess("Users to assign", usersToAssign));
    }
    catch (error) {
        next(commonCatchBlock(error));
    }
}

const transferIssue = async (req, res, next) => {
    try {
        const issueId = req.params.issueId;
        const issue = await Issue.findOne({ _id: issueId, isDeleted: false, visibility: "private" });
        if (!issue) {
            next(commonItemNotFound("Issue not found"));
        }
        // update created by
        await Issue.findOneAndUpdate({ _id: issueId, isDeleted: false, visibility: "private" }, { created_by: req.body.transferId, last_updated_by: req.body.last_updated_by });
        
        // update all comment why comment created by
        // await Comments.updateMany({
        //     issue_id: issueId,
        //     isDeleted: false
        // }, { created_by: req.body.transferId });

        const issue2 = await Issue.findById(issueId).populate({
            path: 'created_by',
            select: 'username email'
        }).populate({
            path: 'project_id',
            select: 'title'
        }).populate({
            path: 'last_updated_by',
            select: 'username email'
        });

        commonConsole(issue2, "from transferIssue /path:issue-controller.js [transferIssue] 865");
        next(commonSuccess("Issue transferred", issue2));
    }
    catch (error) {
        next(commonCatchBlock(error));
    }
}
        

module.exports = {
    getAllIssues,
    getIssue,
    createIssue,
    updateIssue,
    deleteIssue,
    addComment,
    getCommentsOnIssue,
    updateCommentIssue,
    deleteCommentIssue,
    getIssuesByProject,
    getIssueTracker,
    getIssueTrackerId,
    createIssueTracker,
    updateIssueTrackerId,
    deleteIssueTracker,
    getIssueTrackerByProject,
    getIssueTrackerByUser,
    updateITStatusForUser,
    getIssueTrackerReviewForUser,
    getPublicIssue,
    createPublicIssue,
    getIssuesByUser,
    getUsersToAssign,
    transferIssue
};
