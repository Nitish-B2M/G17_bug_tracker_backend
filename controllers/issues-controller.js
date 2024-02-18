const UserModel = require('../models/user-model');
const File = require('../models/file-model');
const Project = require('../models/project-model');
const Issue = require('../models/issue-model');
const IssueTracker = require('../models/issue-tracker-model');

// GET all issues
const getAllIssues = async (req, res, next) => {
    try {
        const issues = await Issue.find({}).populate({
            path: 'created_by',
            select: 'username email'
        }).populate({
            path: 'project_id',
            select: 'projectname title'
            // sort by last updated
        }).sort({ updatedAt: -1 });
        next({
            statusCode: 200,
            status: true,
            message: "All issues",
            data: issues,
        });
    } catch (error) {
        next({
            statusCode: 500,
            status: false,
            message: "Internal Server Error",
            extraDetails: error,
        });
    }
};

// GET a single issue
const getIssue = async (req, res, next) => {
    try {
        const title = req.params.title;

        Issue.findOne({ title: title }).then((issue) => {
            if (!issue) {
                next({
                    statusCode: 404,
                    status: false,
                    message: "Issue not found",
                });
            }
            next({
                statusCode: 200,
                status: true,
                message: "Issue",
                data: issue,
            });
        }).catch((error) => {
            next({
                statusCode: 500,
                status: false,
                message: "Internal Server Error",
                extraDetails: error,
            });
        });
    } catch (error) {
        next({
            statusCode: 500,
            status: false,
            message: "Internal Server Error",
            extraDetails: error,
        });
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
        const issue = await Issue.findOne({ title : req.body.title, project_id: req.body.project_id });
        if (issue) {
            console.log("Issue for this project already exists");
            next({
                statusCode: 400,
                status: false,
                message: "Issue for this project already exists",
            });
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
            console.log(req.body);
            const newIssue = await Issue.create(issue);
            
            next({
                statusCode: 201,
                status: true,
                message: "Issue created",
                data: newIssue,
            });
        }
    }
    catch (error) {
        next({
            statusCode: 500,
            status: false,
            message: "Internal Server Error",
            extraDetails: error,
        });
    }

};

// PUT update an issue
const updateIssue = async (req, res, next) => {
    try {
        const title = req.params.title;
        const issue = await Issue.findOne({ title: title });
        if (!issue) {
            next({
                statusCode: 404,
                status: false,
                message: "Issue not found",
            });
        }
        issue.title = req.body.title;
        issue.description = req.body.description;
        issue.project_id = req.body.project_id;
        issue.created_by = req.body.created_by;
        issue.status = req.body.status;
        issue.priority = req.body.priority;
        issue.visibility = req.body.visibility;
        issue.feature = req.body.feature;
        issue.due_date = req.body.due_date;
        issue.last_updated_by = req.body.last_updated_by;
        await issue.save();
        next({
            statusCode: 200,
            status: true,
            message: "Issue updated",
            data: issue,
        });
    } catch (error) {
        next({
            statusCode: 500,
            status: false,
            message: "Internal Server Error",
            extraDetails: error,
        });
    }
};

// DELETE an issue
const deleteIssue = async (req, res, next) => {
    try {
        const title = req.params.title;
        const issue = await Issue.findOne({ title: title });
        if (!issue) {
            next({
                statusCode: 404,
                status: false,
                message: "Issue not found",
            });
        }
        await issue.remove();
        next({
            statusCode: 200,
            status: true,
            message: "Issue deleted",
            data: issue,
        });
    } catch (error) {
        next({
            statusCode: 500,
            status: false,
            message: "Internal Server Error",
            extraDetails: error,
        });
    }
};

// issue tracker
const getIssueTracker = async (req, res, next) => {
    try {
        const issueTracker = await IssueTracker.find({});
        console.log(issueTracker);
        console.log(issueTracker);
        next({
            statusCode: 200,
            status: true,
            message: "Issue tracker",
            data: issueTracker,
        });
    } catch (error) {
        next({
            statusCode: 500,
            status: false,
            message: "Internal Server Error",
            extraDetails: error,
        });
    }
};

// get issue tracker by id -- to-do: working left
const getIssueTrackerByName = async (req, res, next) => {
    try {
        const issue_id = req.params.issue_id;
        const issueTracker = await IssueTracker.findOne({ issue_id: issue_id }).populate({
            path: 'issue_id',
            select: 'title description'
        }).populate({
            path: 'assigned_to',
            select: 'username email'
        }).populate({
            path: 'file_id',
            select: 'filename'
        });
        if (!issueTracker) {
            next({
                statusCode: 404,
                status: false,
                message: "Issue tracker not found",
            });
        }
        next({
            statusCode: 200,
            status: true,
            message: "Issue tracker",
            data: issueTracker,
        });
    } catch (error) {
        next({
            statusCode: 500,
            status: false,
            message: "Internal Server Error",
            extraDetails: error,
        });
    }
};

// create issue tracker
const createIssueTracker = async (req, res, next) => {
    try {
        const issueTracker = {
                issue_id: req.body.issue_id,
                assigned_to: req.body.assigned_to,
                comment: req.body.comment,
                status: req.body.status
            }
        console.log(issueTracker);
        const newIssueTracker = await IssueTracker.create(issueTracker);
        next({
            statusCode: 201,
            status: true,
            message: "Issue tracker created",
            data: newIssueTracker,
        });
    }
    catch (error) {
        next({
            statusCode: 500,
            status: false,
            message: "Internal Server Error",
            extraDetails: error,
        });
    }
}

// update issue tracker to-do: working left
const updateIssueTrackerByName = async (req, res, next) => {
    try {
        const issue_id = req.params.issue_id;
        const issueTracker = await IssueTracker.findOne({ issue_id: issue_id });
        if (!issueTracker) {
            return res.status(404).json({ message: "Issue tracker not found" });
        }
        const issue = await Issue.findOne({ title: req.body.title });
        if (!issue) {
            return res.status(404).json({ message: "Issue not found" });
        }
        const user = await UserModel.findOne({ username: req.body.assigned_to });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        issueTracker.issue_id = issue._id;
        issueTracker.assigned_to = user._id;
        issueTracker.comment = req.body.comment;
        issueTracker.file_id = req.body.file_id;
        issueTracker.status = req.body.status;
        await issueTracker.save();
        next({
            statusCode: 200,
            status: true,
            message: "Issue tracker updated",
            data: issueTracker,
        });
    } catch (error) {
        next({
            statusCode: 500,
            status: false,
            message: "Internal Server Error",
            extraDetails: error,
        });
    }
}

// delete issue tracker to-do: working left
const deleteIssueTracker = async (req, res, next) => {
    try {
        const issue_id = req.params.issue_id;
        const issueTracker = await IssueTracker.findOne({ issue_id: issue_id });
        if (!issueTracker) {
            next({
                statusCode: 404,
                status: false,
                message: "Issue tracker not found",
            });
        }
        await issueTracker.remove();
        next({
            statusCode: 200,
            status: true,
            message: "Issue tracker deleted",
            data: issueTracker,
        });
    } catch (error) {
        next({
            statusCode: 500,
            status: false,
            message: "Internal Server Error",
            extraDetails: error,
        });
    }
}

module.exports = {
    getAllIssues,
    getIssue,
    createIssue,
    updateIssue,
    deleteIssue,
    getIssueTracker,
    getIssueTrackerByName,
    createIssueTracker,
    updateIssueTrackerByName,
    deleteIssueTracker
};
