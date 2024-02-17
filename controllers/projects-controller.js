const md5 = require('md5');
const ProjectModel = require('../models/project-model');


// GET all project
const getAllProject = async (req, res) => {
    try {
        const project = await ProjectModel.find({}).populate({
            path: 'created_by',
            select: 'username email'
        });
        console.log(JSON.stringify(project, null, 4));
        res.status(200).json({
            "message": "All project",
            "project": project
        });
    } catch (error) {
        res.status(500).json({
            "message": "Error Message",
            error: error
        });
    }
};

// GET a single project
const getProject = async (req, res) => {
    try {
        const name = req.params.projectname;
        
        ProjectModel.findOne({ name: name }).then((project) => {
            if (!project) {
                return res.status(404).json({ message: "Project not found" });
            }
            res.status(200).json({
                message: "All project",
                project: project,
            });
        }).catch((error) => {
            res.status(500).json({
                "message": "Error Message",
                error: error
            });
        }
        );
    } catch (error) {
        res.status(500).json({
            "message": "Error Message",
            error: error
        });
    }
};

// POST a new project
const createProject = async (req, res) => {
    try {
        console.log(req.body);
        const project = await ProjectModel.findOne({ projectname: req.body.projectname });
        if (project) {
            console.log("Project already exists");
            return res.status(400).json({ message: "Project already exists" });
        } else {
            const project = {
                projectname: req.body.projectname,
                title: req.body.title,
                description: req.body.description,
                file_id: req.body.file_id,
                created_by: req.body.created_by,
                lead: req.body.lead,
                status: req.body.status,
                department: req.body.department,
                createdAt: req.body.createdAt,
                updatedAt: req.body.updatedAt,
            }
            const newProject = new ProjectModel(project);
            await newProject.save();
            res.status(200).json({
                "message": "Project created",
                "project": newProject
            });
        }   
    } catch (error) {
        res.status(500).json({
            "message": "Error Message",
            error: error
        });
    }
};

// PUT update a project
const updateProject = async (req, res) => {
    try {
        const projectname = req.params.projectname;
        const project = await ProjectModel.findOne({ projectname: projectname });
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }
        project.projectname = req.body.projectname;
        project.title = req.body.title;
        project.description = req.body.description;
        project.file_id = req.body.file_id;
        project.created_by = req.body.created_by;
        project.lead = req.body.lead;
        project.status = req.body.status;
        project.department = req.body.department;
        await project.save();
        res.status(200).json({
            "message": "Project updated",
            "updatedProject": project
        });
    } catch (error) {
        res.status(500).json({
            "message": "Error Message",
            error: error
        });
    }
};

// DELETE a project
const deleteProject = async (req, res) => {
    try {
        const projectname = req.params.projectname;
        const projectDelete = await ProjectModel.findOneAndDelete({ projectname: projectname });
        if (!projectDelete) {
            return res.status(404).json({ message: "Project not found" });
        }
        res.status(200).json({
            "message": "Project deleted",
            "deletedProject": projectDelete
        });
    } catch (error) {
        res.status(500).json({
            "message": "Error Message",
            error: error
        });
    }
};

// GET all projects for a user
const getProjectsForUser = async (req, res) => {
    try {
        const userId = req.params.userId;

        if (userId !== req.session.userId) {
            return res.status(401).json({ message: "Unauthorized" });
        } else {
            const projects = await ProjectModel.find({ created_by: userId });
            console.log(projects);
            if (!projects) {
                return res.status(404).json({ message: "Project not found", status: false });
            }
            res.status(200).json({
                "message": "All project",
                "projects": projects,
                status: true
            });
        }

    } catch (error) {
        res.status(500).json({
            "message": "Error Message" + error,
            status: false
        });
    }
};

module.exports = {
    getAllProject,
    getProject,
    createProject,
    updateProject,
    deleteProject,
    getProjectsForUser
};


