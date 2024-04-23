const express = require('express');
const router = express.Router();
const fileUpload = require('../middleware/fileUploadMiddleware_Issue');
const Issue = require('../controllers/issues-controller');

// GET all issues
router.get('/', Issue.getAllIssues);

// GET a single issue
router.get('/:issueId', Issue.getIssue);

// POST a new issue
// router.post('/', fileUpload.array('file', 5), Issue.createIssue);
router.route('/').post(fileUpload.array('file', 5), Issue.createIssue);

// PUT update a issue
router.put('/:issueId', Issue.updateIssue);

// DELETE a issue
router.delete('/:issueId', Issue.deleteIssue);

// GET all issues by project
router.get('/project/:projectId', Issue.getIssuesByProject);

// POST a new comment to an issue
router.post('/comments/:issueId', Issue.addComment);

// GET all comments by issue
router.get('/comments/:issueId', Issue.getCommentsOnIssue);

// UPDATE a comment by issue
router.put('/comments/:issueId/:commentId', Issue.updateCommentIssue);

// DELETE a comment by issue
router.delete('/comments/:issueId/:commentId', Issue.deleteCommentIssue);

// GET a single public issue
router.get('/public-issues/:publicIssueId', Issue.getPublicIssue);

// POST a new public issue
router.post('/public-issues', Issue.createPublicIssue);

// PUT update a public issue

// DELETE a public issue

// GET user assigned issues along with public visibility of issues
router.get('/user/:userId', Issue.getIssuesByUser);

// GET user to assign to an issue
router.get('/:issueId/assignee', Issue.getUsersToAssign);

// POST transfer an issue to another user
router.post('/:issueId/transfer', Issue.transferIssue);

module.exports = router;