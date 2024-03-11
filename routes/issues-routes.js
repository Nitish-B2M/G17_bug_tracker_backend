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

module.exports = router;