const express = require('express');
const router = express.Router();
const publicIssue = require('../controllers/public-issue-controller');

// GET all public issues
router.get('/', publicIssue.getAllPublicIssues);

// GET a single public issue ?user_id="+user.userId // to get the user id
router.get('/:publicIssueId', publicIssue.getPublicIssue);

// POST a new public issue
router.post('/', publicIssue.createPublicIssue);

// PUT update a public issue
router.put('/:publicIssueId', publicIssue.updatePublicIssue);

// DELETE a public issue
router.delete('/:publicIssueId', publicIssue.deletePublicIssue);

// POST a new public interaction
router.post('/interaction/:publicIssueId', publicIssue.createPublicInteraction);

// POST a new comment to an issue
router.post('/comments/:issueId', publicIssue.addComment);

// GET all comments of an issue
router.get('/comments/:issueId', publicIssue.getCommentsOnPublicIssue);
module.exports = router;