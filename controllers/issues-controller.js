const UserModel = require('../models/user-model');
const File = require('../models/file-model');
const Project = require('../models/project-model');
const Issue = require('../models/issue-model');
const IssueTracker = require('../models/issue-tracker-model');

// GET all issues
const getAllIssues = async (req, res) => {
    try {
        const issues = await Issue.find({}).populate({
            path: 'created_by',
            select: 'username email'
        }).populate({
            path: 'project_id',
            select: 'projectname'
        });
               
        console.log(JSON.stringify(issues, null, 4));
        res.status(200).json({
            "message": "All issues",
            "issues": issues
        });
    } catch (error) {
        res.status(500).json({
            "message": "Error Message",
            error: error
        });
    }
};

// GET a single issue
const getIssue = async (req, res) => {
    try {
        const title = req.params.title;

        Issue.findOne({ title: title }).then((issue) => {
            if (!issue) {
                return res.status(404).json({ message: "Issue not found" });
            }
            res.status(200).json({
                message: "All issues",
                issue: issue,
            });
        }).catch((error) => {
            res.status(500).json({
                "message": "Error Message",
                error: error
            });
        }
        );
    } catch (error) {
        res.status(500).json({
            "message": "Error Message",
            error: error
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
const createIssue = async (req, res) => {
    // work on this function
    try {
        const issue = await Issue.findOne({ title : req.body.title });
        if (issue) {
            console.log("Issue already exists");
            return res.status(400).json({ message: "Issue already exists" });
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
            
            res.status(201).json({
                "message": "Issue created",
                "issue": newIssue,
                "status": true
            });
        }
    }
    catch (error) {
        res.status(500).json({
            "message": "Error Message: " + error + " from createIssue",
            "status": false
        });
    }

};

// PUT update an issue
const updateIssue = async (req, res) => {
    try {
        const title = req.params.title;
        const issue = await Issue.findOne({ title: title });
        if (!issue) {
            return res.status(404).json({ message: "Issue not found" });
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
        res.status(200).json({
            "message": "Issue updated",
            "issue": issue
        });
    } catch (error) {
        res.status(500).json({
            "message": "Error Message",
            error: error
        });
    }
};

// DELETE an issue
const deleteIssue = async (req, res) => {
    try {
        const title = req.params.title;
        const issue = await Issue.findOne({ title: title });
        if (!issue) {
            return res.status(404).json({ message: "Issue not found" });
        }
        await issue.remove();
        res.status(200).json({
            "message": "Issue deleted",
            "issue": issue
        });
    } catch (error) {
        res.status(500).json({
            "message": "Error Message",
            error: error
        });
    }
};

// issue tracker
const getIssueTracker = async (req, res) => {
    try {
        const issueTracker = await IssueTracker.find({});
        console.log(issueTracker);
        console.log(issueTracker);
        res.status(200).json({
            "message": "All issue trackers",
            "issueTracker": issueTracker
        });
    } catch (error) {
        res.status(500).json({
            "message": "Error Message", 
            error: error
        });
    }
};

// get issue tracker by id -- to-do: working left
const getIssueTrackerByName = async (req, res) => {
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
            return res.status(404).json({ message: "Issue tracker not found" });
        }
        res.status(200).json({
            "message": "Issue tracker",
            "issueTracker": issueTracker
        });
    } catch (error) {
        res.status(500).json({
            "message": "Error Message",
            error: error
        });
    }
};

// create issue tracker
const createIssueTracker = async (req, res) => {
    try {
        const issueTracker = {
                issue_id: req.body.issue_id,
                assigned_to: req.body.assigned_to,
                comment: req.body.comment,
                status: req.body.status
            }
        console.log(issueTracker);
        const newIssueTracker = await IssueTracker.create(issueTracker);
        res.status(201).json({
            "message": "Issue tracker created",
            "issueTracker": newIssueTracker
        });
    }
    catch (error) {
        res.status(500).json({
            "message": "Error Message",
            error: error
        });
    }
}

// update issue tracker to-do: working left
const updateIssueTrackerByName = async (req, res) => {
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
        res.status(200).json({
            "message": "Issue tracker updated",
            "issueTracker": issueTracker
        });
    } catch (error) {
        res.status(500).json({
            "message": "Error Message",
            error: error
        });
    }
}

// delete issue tracker to-do: working left
const deleteIssueTracker = async (req, res) => {
    try {
        const issue_id = req.params.issue_id;
        const issueTracker = await IssueTracker.findOne({ issue_id: issue_id });
        if (!issueTracker) {
            return res.status(404).json({ message: "Issue tracker not found" });
        }
        await issueTracker.remove();
        res.status(200).json({
            "message": "Issue tracker deleted",
            "issueTracker": issueTracker
        });
    } catch (error) {
        res.status(500).json({
            "message": "Error Message",
            error: error
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
