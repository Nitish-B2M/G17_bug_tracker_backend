const express = require('express');
const router = express.Router();
const Issue = require('../controllers/issues-controller');

// issue tracker
router.get('/', Issue.getIssueTracker);

// get issue tracker by id
router.get('/:issuetrackername', Issue.getIssueTrackerByName);

// create issue tracker
router.post('/', Issue.createIssueTracker);

// update issue tracker
router.put('/:issuetrackername', Issue.updateIssueTrackerByName);

// delete issue tracker
router.delete('/:issuetrackername', Issue.deleteIssueTracker);

module.exports = router;