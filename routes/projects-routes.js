const express = require('express');
const router = express.Router();
const Project = require('../controllers/projects-controller');

// GET all project
router.get('/', Project.getAllProject);

// GET a single project
router.get('/:projectId', Project.getProject);

// POST a new project
router.post('/', Project.createProject);

// PUT update a project
router.put('/:projectId', Project.updateProject);

// DELETE a project
router.delete('/:projectId', Project.deleteProject);

// GET all projects for a user
router.get('/user/:userId', Project.getProjectsForUser);

// POST assign a user to a project
router.post('/:projectId/assign', Project.assignUserToProject);

// DELETE remove a user from a project
router.delete('/:projectId/remove', Project.removeUserFromProject);

// GET all projects for a user
router.get('/users/:projectId', Project.getProjectUsers);

// GET all issues created by a user for a project
router.get('/:projectId/issues/user/:userId', Project.getIssuesCreatedByUserForProject);

module.exports = router;