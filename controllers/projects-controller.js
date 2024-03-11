const ProjectModel = require('../models/project-model');
const commonConsole = require('../common/commonConsole');
const { commonSuccess, commonItemCreated, commonItemNotFound, commonCatchBlock } = require('../common/commonStatusCode');


// GET all project
const getAllProject = async (req, res, next) => {
    try {
        const project = await ProjectModel.find({}).populate({
            path: 'created_by',
            select: 'username email'
        });

        commonConsole(project, "All project :/projects-controller.js [getAllProject] 29");
        next(commonSuccess("All projects", project));
    } catch (error) {
        next(commonCatchBlock(error));
    }
};

// GET a single project
const getProject = async (req, res, next) => {
    try {
        const projectId = req.params.projectId;
        
        ProjectModel.findOne({ _id: projectId }).populate({
            path: 'created_by',
            select: 'username email'
        }).populate({
            path: 'lead',
            select: 'username email'
        }).then((project) => {
            if (!project) {
                next(commonItemNotFound("Project not found"));
            }
            next(commonSuccess("Project found", project));
        }).catch((error) => {
            next(commonCatchBlock(error));
        });
    } catch (error) {
        next(commonCatchBlock(error));
    }
};

// POST a new project
const createProject = async (req, res, next) => {
    try {
        const project = await ProjectModel.findOne({ title: req.body.title });
        if (project) {
            commonConsole(project, "Project already exists :/projects-controller.js [createProject] 75");
            next(commonItemCreated("Project already exists", project));
        } else {
            const project = {
                title: req.body.title,
                description: req.body.description,
                created_by: req.body.created_by,
                lead: req.body.lead,
                status: req.body.status,
                department: req.body.department,
            }
            const newProject = new ProjectModel(project);
            await newProject.save();
            
            commonConsole(newProject, "Project created successfully :/projects-controller.js [createProject] 90");
            next(commonItemCreated("Project created successfully", newProject));
        }   
    } catch (error) {
        next(commonCatchBlock(error));
    }
};

// PUT update a project
const updateProject = async (req, res, next) => {
    try {
        const projectId = req.params.projectId;
        const project = await ProjectModel.findOne({ _id: projectId });
        if (!project) {
            next(commonItemNotFound("Project not found"));
        }
        project.title = req.body.title;
        project.description = req.body.description;
        project.file_id = req.body.file_id;
        project.created_by = req.body.created_by;
        project.lead = req.body.lead;
        project.status = req.body.status;
        project.department = req.body.department;
        await project.save();
        const data = {
                projectId: project._id,
                title: project.title,
                description: project.description,
                created_by: project.created_by,
                lead: project.lead,
                status: project.status,
                department: project.department,
            }

        commonConsole(project, "Project updated successfully :/projects-controller.js [updateProject] 125");
        next(commonSuccess("Project updated successfully", data));
    } catch (error) {
        next(commonCatchBlock(error));
    }
};

// DELETE a project
const deleteProject = async (req, res, next) => {
    try {
        const projectId = req.params.projectId;
        const projectDelete = await ProjectModel.findOneAndDelete({ _id: projectId });
        if (!projectDelete) {
            next(commonItemNotFound("Project not found"));
        }
        commonConsole(projectDelete, "Project deleted successfully :/projects-controller.js [deleteProject] 143");
        next(commonSuccess("Project deleted successfully", projectDelete));
    } catch (error) {
        next(commonCatchBlock(error));
    }
};

// GET all projects for a user
const getProjectsForUser = async (req, res, next) => {
    try {
        const userId = req.params.userId;

        // if (userId !== req.session.userId) {
        //     return res.status(401).json({ message: "Unauthorized" });
        // } else {
            const projects = await ProjectModel.find({ created_by: userId });
            if (!projects) {
                next(commonItemNotFound("No projects found"));
            }
            next(commonSuccess("Projects found", projects));
        // }

    } catch (error) {
        next(commonCatchBlock(error));
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


