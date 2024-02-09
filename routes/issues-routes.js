const express = require('express');
const router = express.Router();
const Issue = require('../controllers/issues-controller');

// GET all issues
router.get('/', Issue.getAllIssues);

// GET a single issue
router.get('/:issuename', Issue.getIssue);

// POST a new issue
router.post('/', Issue.createIssue);

// PUT update a issue
router.put('/:issuename', Issue.updateIssue);

// DELETE a issue
router.delete('/:issuename', Issue.deleteIssue);

module.exports = router;