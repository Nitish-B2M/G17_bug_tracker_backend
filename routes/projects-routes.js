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

module.exports = router;