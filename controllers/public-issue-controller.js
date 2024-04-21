const PublicIssueModel = require('../models/public-issue-model');
const PublicIssueTrackerModel = require('../models/public-issue-tracker-model');
const PublicInteractionModel = require('../models/public-interaction-model');
const Comments = require('../models/comment-model');
const commonConsole = require('../common/commonConsole');
const { commonSuccess, commonItemCreated, commonItemNotFound, commonCatchBlock, commonNotModified } = require('../common/commonStatusCode');

// GET all public issues
const getAllPublicIssues = async (req, res, next) => {
    try {
        const publicIssue = await PublicIssueModel.find({}).populate({
            path: 'created_by',
            select: 'username email'
        }).sort({ updatedAt: -1 });

        // commonConsole(publicIssue, "All public issue :/public-issue-controller.js [getAllPublicIssues] 29");
        next(commonSuccess("All public issues", publicIssue));
    } catch (error) {
        next(commonCatchBlock(error));
    }
};

// GET a single public issue
const getPublicIssue = async (req, res, next) => {
    try {
        const publicIssueId = req.params.publicIssueId;
        const user = req.query.user_id;

        const publicIssue = await PublicIssueModel.findOne({ _id: publicIssueId }).populate({
            path: 'created_by',
            select: 'username email'
        });
        if (!publicIssue) {
            next(commonItemNotFound("Public Issue not found"));
        }
        // add voted: true if the user has voted for the public issue
        const publicInteraction = await PublicInteractionModel.findOne({
            user_id: user,
            issue_id: publicIssueId,
        });
        if (publicInteraction) {
            var data = { voted: true, votedInteraction: publicInteraction.interaction };
        } else {
            var data = { voted: false };
        }
        commonConsole(publicIssue, "Public Issue interactions :/public-issue-controller.js [getPublicIssue] 65");
        next(commonSuccess("Public Issue", {data, publicIssue}));

    } catch (error) {
        next(commonCatchBlock(error));
    }
};

// POST a new public issue
const createPublicIssue = async (req, res, next) => {
    try {
        
    }
    catch (error) {
        next(commonCatchBlock(error));
    }
}

// PUT update a public issue
const updatePublicIssue = async (req, res, next) => {
    try {
        const publicIssueId = req.params.publicIssueId;
        const publicIssue = await PublicIssueModel.findOne({ _id: publicIssueId });
        if (!publicIssue) {
            next(commonItemNotFound("Public Issue not found"));
        } else {
            commonConsole(req.body, "Public Issue updated :/public-issue-controller.js [updatePublicIssue] 107");
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

const createPublicInteraction = async (req, res, next) => {
    try {
        const publicIssueId = req.params.publicIssueId;
        const publicIssue = await PublicIssueModel.findOne({ _id: publicIssueId });
        if (!publicIssue) {
            next(commonItemNotFound("Public Issue not found"));
        } else {
            // check if the user has already interacted with the public issue
            const publicInteractionModel = await PublicInteractionModel.findOne({
                user_id: req.body.user_id,
                issue_id: publicIssueId,
            });
            if (publicInteractionModel) {
                // check current interaction with the previous interaction
                if (publicInteractionModel.interaction === req.body.interaction) {
                    // then remove the interaction
                    await PublicInteractionModel.findOneAndDelete({
                        user_id: req.body.user_id,
                        issue_id: publicIssueId,
                    });
                    // also update the public issue upvote and downvote count
                    if (req.body.interaction === "upvote") {
                        await PublicIssueModel.findOneAndUpdate({ _id: publicIssueId }, { $inc: { upvotes: -1 } });
                        await PublicIssueModel.findOneAndUpdate({ _id: publicIssueId }, { $max: { upvotes: 0 } });
                    }
                    if (req.body.interaction === "downvote") {
                        await PublicIssueModel.findOneAndUpdate({ _id: publicIssueId }, { $inc: { downvotes: -1 } });
                        await PublicIssueModel.findOneAndUpdate({ _id: publicIssueId }, { $max: { downvotes: 0 } });
                    }
                    const publicInteraction = await PublicInteractionModel.findOne({
                        user_id: req.body.user_id,
                        issue_id: publicIssueId,
                    });
                    if (publicInteraction) {
                        var data = { voted: true, votedInteraction: publicInteraction.interaction };
                    } else {
                        var data = { voted: false };
                    }


                    const publicIssue = await PublicIssueModel.findOne({ _id: publicIssueId }).populate({
                        path: 'created_by',
                        select: 'username email'
                    });
                    if (!publicIssue) {
                        next(commonItemNotFound("Public Issue not found"));
                    }
                    commonConsole(publicIssue, "Removed Public interaction :/public-issue-controller.js [createPublicInteraction] 139");
                    next(commonItemCreated("Removed Public interaction", {data, publicIssue}));
                } else {
                    const updatedPublicInteractionModel = await PublicInteractionModel.findOneAndUpdate({
                        user_id: req.body.user_id,
                        issue_id: publicIssueId,
                    }, {
                        interaction: req.body.interaction,
                    }, {
                        new: true,
                        runValidators: true,
                    });
                    await PublicIssueModel.findOneAndUpdate({ _id: publicIssueId }, { updatedAt: new Date() });
                    // also update the public issue upvote and downvote count
                    if (req.body.interaction === "upvote") {
                        await PublicIssueModel.findOneAndUpdate({ _id: publicIssueId }, { $inc: { upvotes: 1, downvotes: -1 } });
                        // if downvotes is less than 0, set it to 0
                        await PublicIssueModel.findOneAndUpdate({ _id: publicIssueId }, { $max: { downvotes: 0 } });
                    } else {
                        commonConsole(req.body.interaction, "Downvote interaction :/public-issue-controller.js [createPublicInteraction] 139");
                        await PublicIssueModel.findOneAndUpdate({ _id: publicIssueId }, { $inc: { upvotes: -1, downvotes: 1 } });
                        // if upvotes is less than 0, set it to 0
                        await PublicIssueModel.findOneAndUpdate({ _id: publicIssueId }, { $max: { upvotes: 0 } });
                    }

                    const publicIssue = await PublicIssueModel.findOne({ _id: publicIssueId }).populate({
                        path: 'created_by',
                        select: 'username email'
                    });
                    if (!publicIssue) {
                        next(commonItemNotFound("Public Issue not found"));
                    }
                    const publicInteraction = await PublicInteractionModel.findOne({
                        user_id: req.body.user_id,
                        issue_id: publicIssueId,
                    });
                    if (publicInteraction) {
                        var data = { voted: true, votedInteraction: publicInteraction.interaction };
                    } else {
                        var data = { voted: false };
                    }

                    commonConsole(updatedPublicInteractionModel.interaction, "Updated Public interaction :/public-issue-controller.js [createPublicInteraction] 139");
                    next(commonItemCreated("Updated Public interaction", {data, publicIssue}));
                }
            } else {
                const publicInteractionBody = {
                    user_id: req.body.user_id,
                    issue_id: publicIssueId,
                    interaction: req.body.interaction,
                }
                const publicInteractionModel = await PublicInteractionModel.create(publicInteractionBody);
                await PublicIssueModel.findOneAndUpdate({ _id: publicIssueId }, { updatedAt: new Date() });
                // also update the public issue upvote and downvote count
                if (req.body.interaction === "upvote") {
                    await PublicIssueModel.findOneAndUpdate({ _id: publicIssueId }, { $inc: { upvotes: 1 } });
                }
                if (req.body.interaction === "downvote") {
                    await PublicIssueModel.findOneAndUpdate({ _id: publicIssueId }, { $inc: { downvotes: 1 } });
                }
                const publicIssue = await PublicIssueModel.findOne({ _id: publicIssueId }).populate({
                    path: 'created_by',
                    select: 'username email'
                });
                if (!publicIssue) {
                    next(commonItemNotFound("Public Issue not found"));
                }
                const publicInteraction = await PublicInteractionModel.findOne({
                    user_id: req.body.user_id,
                    issue_id: publicIssueId,
                });
                if (publicInteraction) {
                    var data = { voted: true, votedInteraction: publicInteraction.interaction };
                } else {
                    var data = { voted: false };
                }
                commonConsole(publicInteractionModel, "Created Public interaction :/public-issue-controller.js [createPublicInteraction] 139");
                next(commonItemCreated("Created Public interaction", {data, publicIssue}));
            }
        }
    } catch (error) {
        next(commonCatchBlock(error));
    }
}

// POST a new comment to an issue
const addComment = async (req, res, next) => {
    try {
        const issueId = req.params.issueId;
        const comment = req.body.comment;
        const created_by = req.body.commentedBy;
        // check if issue exists
        const issue = await PublicIssueModel.findOne({ _id: issueId });
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
}

// GET all comments by issue
const getCommentsOnPublicIssue = async (req, res, next) => {
    try {
        const issueId = req.params.issueId;
        const issue = await PublicIssueModel.findOne({ _id: issueId });
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
        commonConsole(comments, "from getCommentsOnPublicIssue /path:issue-controller.js [getCommentsOnPublicIssue] 318");
        next(commonSuccess("All comments by issue", comments));
    } catch (error) {
        next(commonCatchBlock(error));
    }
}


module.exports = {
    getAllPublicIssues,
    getPublicIssue,
    createPublicIssue,
    updatePublicIssue,
    deletePublicIssue,
    createPublicInteraction,
    addComment,
    getCommentsOnPublicIssue,
};
