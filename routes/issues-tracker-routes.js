const express = require('express');
const router = express.Router();
const Issue = require('../controllers/issues-controller');

// issue tracker
router.get('/', Issue.getIssueTracker);

// get issue tracker by id
router.get('/:issuetrackerid', Issue.getIssueTrackerId);

// create issue tracker
router.post('/', Issue.createIssueTracker);

// update issue tracker
router.put('/:issuetrackerid', Issue.updateIssueTrackerId);

// delete issue tracker
router.delete('/:issuetrackerid', Issue.deleteIssueTracker);

module.exports = router;