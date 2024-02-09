const express = require('express');
const router = express.Router();
const Project = require('../controllers/projects-controller');

// GET all project
router.get('/', Project.getAllProject);

// GET a single project
router.get('/:projectname', Project.getProject);

// POST a new project
router.post('/', Project.createProject);

// PUT update a project
router.put('/:projectname', Project.updateProject);

// DELETE a project
router.delete('/:projectname', Project.deleteProject);

module.exports = router;