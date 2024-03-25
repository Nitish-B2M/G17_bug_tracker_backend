const PublicIssueModel = require('../models/public-issue-model');
const PublicIssueTrackerModel = require('../models/public-issue-tracker-model');
const commonConsole = require('../common/commonConsole');
const { commonSuccess, commonItemCreated, commonItemNotFound, commonCatchBlock } = require('../common/commonStatusCode');

// GET all public issues
const getAllPublicIssues = async (req, res, next) => {
    try {
        const publicIssue = await PublicIssueModel.find({}).populate({
            path: 'created_by',
            select: 'username email'
        });

        commonConsole(publicIssue, "All public issue :/public-issue-controller.js [getAllPublicIssues] 29");
        next(commonSuccess("All public issues", publicIssue));
    } catch (error) {
        next(commonCatchBlock(error));
    }
};

// GET a single public issue
const getPublicIssue = async (req, res, next) => {
    try {
        const publicIssueId = req.params.publicIssueId;

        PublicIssueModel.findOne({ _id: publicIssueId }).populate({
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
};

// POST a new public issue
const createPublicIssue = async (req, res, next) => {
    try {
        console.log(req.body);
        // const publicIssue = await PublicIssueModel.findOne
        // ({
        //     title: req.body.title,
        //     description: req.body.description,
        //     created_by: req.body.created_by,
        //     feature: req.body.feature,
        // });
        // if (publicIssue) {
        //     commonConsole(publicIssue, "Public Issue already exists :/public-issue-controller.js [createPublicIssue] 75");
        //     next(commonItemCreated("Public Issue already exists", publicIssue));
        // } else {
        //     const publicIssue = {
        //         title: req.body.title,
        //         description: req.body.description,
        //         created_by: req.body.created_by,
        //         feature: req.body.feature,
        //     }
        //     const newPublicIssue = await PublicIssueModel.create(publicIssue);
        //     commonConsole(newPublicIssue, "Public Issue created :/public-issue-controller.js [createPublicIssue] 86");
        //     next(commonItemCreated("Public Issue created", newPublicIssue));
        // }
    }
    catch (error) {
        next(commonCatchBlock(error));
    }
}

// PUT update a public issue
const updatePublicIssue = async (req, res, next) => {
    console.log(req.params.publicIssueId);
    try {
        const publicIssueId = req.params.publicIssueId;
        console.log(req.body);
        const publicIssue = await PublicIssueModel.findOne({ _id: publicIssueId });
        if (!publicIssue) {
            next(commonItemNotFound("Public Issue not found"));
        } else {
            // const updatedPublicIssue = await PublicIssueModel.findByIdAndUpdate(publicIssueId, req.body, {
            //     new: true,
            //     runValidators: true,
            // });
            commonConsole(req.body, "Public Issue updated :/public-issue-controller.js [updatePublicIssue] 107");
            // next(commonSuccess("Public Issue updated", req.body));
        }
    } catch (error) {
        next(commonCatchBlock(error));
    }
};

// DELETE a public issue
const deletePublicIssue = async (req, res, next) => {
    try {
        const publicIssueId = req.params.publicIssueId;
        const publicIssue = await PublicIssueModel.findOne({ _id: publicIssueId });
        if (!publicIssue) {
            next(commonItemNotFound("Public Issue not found"));
        } else {
            await PublicIssueModel.findByIdAndDelete(publicIssueId);
            commonConsole(publicIssue, "Public Issue deleted :/public-issue-controller.js [deletePublicIssue] 124");
            next(commonSuccess("Public Issue deleted", publicIssue));
        }
    } catch (error) {
        next(commonCatchBlock(error));
    }
};

module.exports = {
    getAllPublicIssues,
    getPublicIssue,
    createPublicIssue,
    updatePublicIssue,
    deletePublicIssue,
};
