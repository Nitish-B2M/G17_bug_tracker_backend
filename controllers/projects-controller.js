const ProjectModel = require('../models/project-model');

const commonCatchBlock = (error, next) => {
    next({
        statusCode: 500,
        status: false,
        message: "Internal Server Error",
        extraDetails: error,
    });
};

const commonItemNotFound = (message, next) => {
    next({
        statusCode: 404,
        status: false,
        message: message,
    });
};

// GET all project
const getAllProject = async (req, res, next) => {
    try {
        const project = await ProjectModel.find({}).populate({
            path: 'created_by',
            select: 'username email'
        });
        console.log(JSON.stringify(project, null, 4), "from getAllProject");
        next({
            statusCode: 200,
            status: true,
            message: "All project",
            data: project,
        });
    } catch (error) {
        commonCatchBlock(error, next);
    }
};

// GET a single project
const getProject = async (req, res) => {
    try {
        const name = req.params.projectname;
        
        ProjectModel.findOne({ name: name }).then((project) => {
            if (!project) {
                commonItemNotFound("Project not found", next);
            }
            next({
                statusCode: 200,
                status: true,
                message: "Project found",
                data: project,
            });
        }).catch((error) => {
            commonCatchBlock(error, next);
        });
    } catch (error) {
        commonCatchBlock(error, next);
    }
};

// POST a new project
const createProject = async (req, res, next) => {
    try {
        console.log(req.body);
        const project = await ProjectModel.findOne({ projectname: req.body.projectname });
        if (project) {
            console.log("Project already exists");
            next({
                statusCode: 400,
                status: false,
                message: "Project already exists",
            });
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
            next({
                statusCode: 201,
                status: true,
                message: "Project created successfully",
                data: {
                    projectId: newProject._id,
                    projectname: newProject.projectname,
                    title: newProject.title,
                    description: newProject.description,
                    created_by: newProject.created_by,
                    lead: newProject.lead,
                    status: newProject.status,
                    department: newProject.department,
                }
            });
        }   
    } catch (error) {
        next({
            statusCode: 500,
            message: "Internal Server Error",
            extraDetails: error,
        });
    }
};

// PUT update a project
const updateProject = async (req, res, next) => {
    try {
        const projectname = req.params.projectname;
        const project = await ProjectModel.findOne({ projectname: projectname });
        if (!project) {
            commonItemNotFound("Project not found", next);
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
        next({
            statusCode: 200,
            status: true,
            message: "Project updated successfully",
            data: {
                projectId: project._id,
                projectname: project.projectname,
                title: project.title,
                description: project.description,
                created_by: project.created_by,
                lead: project.lead,
                status: project.status,
                department: project.department,
            }
        });
    } catch (error) {
        commonCatchBlock(error, next);
    }
};

// DELETE a project
const deleteProject = async (req, res, next) => {
    try {
        const projectname = req.params.projectname;
        const projectDelete = await ProjectModel.findOneAndDelete({ projectname: projectname });
        if (!projectDelete) {
            commonItemNotFound("Project not found", next);
        }
        next({
            statusCode: 200,
            status: true,
            message: "Project deleted successfully",
            data: projectDelete,
        });
    } catch (error) {
        commonCatchBlock(error, next);
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
                commonItemNotFound("No projects found", next);
            }
            next({
                statusCode: 200,
                status: true,
                message: "Projects found",
                data: projects,
            });
        // }

    } catch (error) {
        commonCatchBlock(error, next);
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


