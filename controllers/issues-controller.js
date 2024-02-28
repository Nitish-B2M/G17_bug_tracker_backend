const UserModel = require('../models/user-model');
const File = require('../models/file-model');
const Project = require('../models/project-model');
const Issue = require('../models/issue-model');
const IssueTracker = require('../models/issue-tracker-model');
const ObjectId = require('mongoose').Types.ObjectId;

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
        const issueId = req.params.issueId;
        const checkFirstIssue = await Issue.findOne({ _id: issueId });

        if (!checkFirstIssue) {
            next({
                statusCode: 404,
                status: false,
                message: "Issue not found",
            });
        }

        const issue = await Issue.findById(issueId).populate({
            path: 'created_by',
            select: 'username email'
        }).populate({
            path: 'project_id',
            select: 'projectname title'
        });
        // also populate last updated by if not null
        const lastUpdatedBy = issue.last_updated_by;
        if (lastUpdatedBy) {
            const issueWithLastUpdatedBy = await Issue.findById(issueId).populate({
                path: 'created_by',
                select: 'username email'
            }).populate({
                path: 'project_id',
                select: 'projectname title'
            }).populate({
                path: 'last_updated_by',
                select: 'username email'
            });

            next({
                statusCode: 200,
                status: true,
                message: "Issue",
                data: issueWithLastUpdatedBy,
            });
        }
        
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
            const newIssue = await Issue.create(issue);
            await newIssue.save();
            if (!newIssue) {
                next({
                    statusCode: 404,
                    status: false,
                    message: "Issue not created",
                });
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
                    var tempFileObject = {[file[i].filename]: file[i].path}
                    issue.files.push(tempFileObject);
                    await newFile.save();
                }
                console.log(issue, "from createIssue /path:issue-controller.js 180");
                await next({
                    statusCode: 201,
                    status: true,
                    message: "Issue created with attached files",
                    data: issue,
                });
            } else{
                console.log(newIssue, "from createIssue /path:issue-controller.js 180");
                next({
                    statusCode: 201,
                    status: true,
                    message: "Issue created",
                    data: newIssue,
                });
            }
            
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
        const issueId = req.params.issueId;
        const issue = await Issue.findOne({ _id: issueId });

        if (!issue) {
            next({
                statusCode: 404,
                status: false,
                message: "Issue not found",
            });
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
                next({
                    statusCode: 404,
                    status: false,
                    message: "User not found",
                });
            }
            issue.last_updated_by = req.body.last_updated_by;
        }
        await issue.save();
        const issueWithLastUpdatedBy = await Issue.findById(issueId).populate({
            path: 'created_by',
            select: 'username email'
        }).populate({
            path: 'project_id',
            select: 'projectname title'
        }).populate({
            path: 'last_updated_by',
            select: 'username email'
        });

        
        console.log(issueWithLastUpdatedBy, "from updateIssue /path:issue-controller.js 220");
        next({
            statusCode: 200,
            status: true,
            message: "Issue updated",
            data: issueWithLastUpdatedBy,
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
        const issueId = req.params.issueId;
        const issue = await Issue.findOne({ _id: issueId });
        console.log(issue, "from issue-controller.js deleteIssue 244 ");
        if (!issue) {
            next({
                statusCode: 404,
                status: false,
                message: "Issue not found",
            });
        }
        await Issue.deleteOne({_id: issueId});
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
const getIssueTrackerId = async (req, res, next) => {
    try {
        const issue_id = req.params.issuetrackerid;
        const issueTracker = await IssueTracker.find({ issue_id: issue_id }).populate({
            path: 'issue_id',
            select: 'title description'
        }).populate({
            path: 'assigned_to',
            select: 'username email'
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
        // type cast status to enum
        var status = req.body.assignStatus;
        var enumStatus = ['open', 'in-progress', 'resolved', 'on-hold'];
        var typeCastStatus = typeCast(status, enumStatus);

        const issueTracker = {
            issue_id: req.body.assignIssueId,
            assigned_by: req.body.assignedBy,
            assigned_to: req.body.assignTo,
            comment: req.body.assignDescription,
            status: typeCastStatus
        }

        console.log(issueTracker, "from createIssueTracker /path:issue-controller.js 340 388");

        if (issueTracker.issue_id === null || issueTracker.issue_id === undefined || issueTracker.issue_id === "" || issueTracker.issue_id === "undefined") {
            next({
                statusCode: 400,
                status: false,
                message: "Issue ID is undefined",
            });
        }

        const newIssueTracker = await IssueTracker.create(issueTracker); 
        await newIssueTracker.save();
        if (!newIssueTracker) {
            next({
                statusCode: 404,
                status: false,
                message: "Issue for user not found",
            });
        }
        // populate user and issue
        const responseIssueTracker = await IssueTracker.findById(newIssueTracker._id).populate({
            path: 'issue_id',
            select: 'title description'
        }).populate({
            path: 'assigned_to',
            select: 'username email'
        });
        
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
                var tempFileObject = {[file[i].filename]: file[i].path}
                responseIssueTracker.files.push(tempFileObject);
                await newFile.save();
            }
            console.log(responseIssueTracker, "from createIssueTracker /path:issue-controller.js 340 363 423");
            await next({
                statusCode: 201,
                status: true,
                message: "Issue assigned to user with attached files",
                data: responseIssueTracker,
            });
            
        } else{
            console.log(responseIssueTracker, "from createIssueTracker /path:issue-controller.js 340 372");
            next({
                statusCode: 201,
                status: true,
                message: "Issue assigned to user",
                data: responseIssueTracker,
            });
        }

        next({
            statusCode: 201,
            status: true,
            message: "Issue assigned to user",
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
const updateIssueTrackerId = async (req, res, next) => {
    try {
        const issue_id = req.params.issuetrackerid;
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
        const issue_id = req.params.issuetrackerid;
        const issueTracker = await IssueTracker.findOne({ _id: issue_id });
        console.log(issueTracker, "from issue-controller.js deleteIssueTracker 510 ");
        if (!issueTracker) {
            next({
                statusCode: 404,
                status: false,
                message: "Issue tracker not found",
            });
        }
        await IssueTracker.deleteOne({_id: issue_id});
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
    getIssueTrackerId,
    createIssueTracker,
    updateIssueTrackerId,
    deleteIssueTracker
};
