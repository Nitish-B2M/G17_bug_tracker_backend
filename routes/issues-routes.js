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
router.get('/comments/:issueId', Issue.getCommentsByIssue);

// GET a single public issue
router.get('/public-issues/:publicIssueId', Issue.getPublicIssue);

// POST a new public issue
router.post('/public-issues', Issue.createPublicIssue);

module.exports = router;