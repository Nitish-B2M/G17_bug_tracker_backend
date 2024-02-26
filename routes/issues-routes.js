const express = require('express');
const router = express.Router();
const fileUpload = require('../middleware/fileUploadMiddleware_Issue');
const Issue = require('../controllers/issues-controller');

// GET all issues
router.get('/', Issue.getAllIssues);

// GET a single issue
router.get('/:issueId', Issue.getIssue);

// POST a new issue
router.post('/').post(fileUpload.array('file', 5), Issue.createIssue);

// PUT update a issue
router.put('/:issueId', Issue.updateIssue);

// DELETE a issue
router.delete('/:issueId', Issue.deleteIssue);

module.exports = router;