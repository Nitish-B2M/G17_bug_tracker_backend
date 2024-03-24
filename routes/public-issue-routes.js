const express = require('express');
const router = express.Router();

const publicIssue = require('../controllers/public-issue-controller');

// GET all public issues
router.get('/', publicIssue.getAllPublicIssues);

// GET a single public issue
router.get('/:publicIssueId', publicIssue.getPublicIssue);

// POST a new public issue
router.post('/', publicIssue.createPublicIssue);

// PUT update a public issue
router.put('/:publicIssueId', publicIssue.updatePublicIssue);

// DELETE a public issue
router.delete('/:publicIssueId', publicIssue.deletePublicIssue);

module.exports = router;