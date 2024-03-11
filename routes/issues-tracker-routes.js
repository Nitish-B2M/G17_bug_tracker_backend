const express = require('express');
const router = express.Router();
const Issue = require('../controllers/issues-controller');
const fileUpload = require('../middleware/fileUploadMiddleware_IssueTracker');

// issue tracker
router.get('/', Issue.getIssueTracker);

// get issue tracker by id
router.get('/:issuetrackerid', Issue.getIssueTrackerId);

// create issue tracker
// router.post('/', fileUpload.array('file', 5), Issue.createIssueTracker);
// to upload file only this is working
router.route('/').post(fileUpload.array('assignFile', 5), Issue.createIssueTracker);

// update issue tracker
router.put('/:issuetrackerid', Issue.updateIssueTrackerId);

// delete issue tracker
router.delete('/:issuetrackerid', Issue.deleteIssueTracker);

// get issue tracker by project
router.get('/project/:projectId', Issue.getIssueTrackerByProject);

module.exports = router;