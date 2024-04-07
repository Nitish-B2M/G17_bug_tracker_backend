const ProjectModel = require('../models/project-model');
const ProjectUserModel = require('../models/project-user-model');
const IssueModel = require('../models/issue-model');
const commonConsole = require('../common/commonConsole');
const { commonSuccess, commonItemCreated, commonItemNotFound, commonCatchBlock, commonAlreadyExists } = require('../common/commonStatusCode');
const transporter = require('../common/emailConfigurationSetup');


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
            next(commonAlreadyExists("Project already exists", project));
        } else {
            const project = {
                title: req.body.title,
                description: req.body.description,
                created_by: req.body.created_by,
                lead: req.body.lead,
                status: req.body.status,
                visibility: req.body.visibility,
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
        const projectUpdate = {}
        if(req.body.title) { projectUpdate.title = req.body.title; }
        if(req.body.description) { projectUpdate.description = req.body.description; }
        if(req.body.lead) { projectUpdate.lead = req.body.lead; }
        if(req.body.status) { projectUpdate.status = req.body.status; }
        if(req.body.visibility) { projectUpdate.visibility = req.body.visibility; }
        if(req.body.department) { projectUpdate.department = req.body.department; }
        if(req.body.status) { projectUpdate.status = req.body.status; }
        if(req.body.last_updated_by) { projectUpdate.last_updated_by = req.body.last_updated_by; }
        projectUpdate.updatedAt = Date.now();
        
        await ProjectModel.findOneAndUpdate({ _id: projectId }, projectUpdate);

        const updatedProject = await ProjectModel.findOne({ _id: projectId }).populate({
            path: 'created_by',
            select: 'username email'})
            .populate({
                path: 'lead',
                select: 'username email'
            })
            .populate({
                path: 'last_updated_by',
                select: 'username email'
            });

        commonConsole(updatedProject, "Project updated successfully :/projects-controller.js [updateProject] 103");
        next(commonSuccess("Project updated successfully", updatedProject));
        
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

        const projects = await ProjectModel.find({ created_by: userId });   
        var flag1 = false;
        if (!projects) {
            flag1 = true;
        }

        // also get the projects where user is assigned
        const projectsAssigned = await ProjectUserModel.find({ userId: userId }).populate({
            path: 'projectId',
            select: '-__v'
        });
        var flag2 = false;
        if (!projectsAssigned) {
            flag2 = true;
        }

        if (flag1 && flag2) {
            next(commonItemNotFound("No projects found"));
        }
        // merge the two arrays but format must be same also remove duplicates
        const allProjects = [...projects, ...projectsAssigned.map((project) => project.projectId)];
        const uniqueProjects = allProjects.filter((project, index, self) =>
            index === self.findIndex((t) => (
                t._id === project._id
            ))
        );

        commonConsole(uniqueProjects, "Projects found :/projects-controller.js [getProjectsForUser] 154");
        next(commonSuccess("Projects found", uniqueProjects));

    } catch (error) {
        next(commonCatchBlock(error));
    }
};

const assignUserToProject = async (req, res, next) => {
    try {
        const projectId = req.params.projectId;
        const users = req.body.data.users;
        const assignedBy = req.body.data.assignedBy;

        if (users.length === 0) {
            next(commonItemCreated("No user selected", users));
            return;
        }

        const project = await ProjectModel.findOne({ _id: projectId });
        if (!project) {
            next(commonItemNotFound("Project not found"));
        }
        
        for (let i = 0; i < users.length; i++) {
            const projectUser = await ProjectUserModel.findOne({ projectId: projectId, userId: users[i].value });
            if (projectUser) {
                next(commonAlreadyExists("\""+ users[i].label+ "\" user already assigned to project" , projectUser));
                return;
            }
        }

        for (let i = 0; i < users.length; i++) {
            const projectUser = {
                projectId: projectId,
                userId: users[i].value,
                assignedBy: assignedBy.userId,
            }
            const newProjectUser = new ProjectUserModel(projectUser);
            await newProjectUser.save();

            transporter.sendMail({
                from: 'nitishxsharma08@gmail.com',
                to: 'nitishssharma20@gnu.ac.in',
                subject: 'You are assigned to a ' + project.title + ' project',
                text: 'You are assigned to a project: \'<b>' + project.title + '\'</b> by \'' + assignedBy.username + '\' (' + assignedBy.email + ')'
            }, (error, info) => {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });
        }

        next(commonSuccess("User assigned to project", users));

    }
    catch (error) {
        next(commonCatchBlock(error));
    }
};

const removeUserFromProject = async (req, res, next) => {
    try {
        const projectId = req.params.projectId;
        const userId = req.params.userId;

        const project = await ProjectModel.findOne({ _id: projectId });
        if (!project) {
            next(commonItemNotFound("Project not found"));
        }

        const projectUser = await ProjectUserModel.findOneAndDelete({ projectId: projectId, userId: userId });
        if (!projectUser) {
            next(commonItemNotFound("User not found"));
        }
        next(commonSuccess("User removed from project", projectUser));
    }
    catch (error) {
        next(commonCatchBlock(error));
    }
}

const getProjectUsers = async (req, res, next) => {
    try {
        const projectId = req.params.projectId;
        const projectUsers = await ProjectUserModel.find({ projectId: projectId }).populate({
            path: 'userId',
            select: 'username email'
        });

        if (!projectUsers) {
            next(commonItemNotFound("No users found"));
        }
        next(commonSuccess("Users found", projectUsers));
    }
    catch (error) {
        next(commonCatchBlock(error));
    }
}

const getIssuesCreatedByUserForProject = async (req, res, next) => {
    try {
        const projectId = req.params.projectId;
        const userId = req.params.userId;
        
        const project = await ProjectModel.findOne({ _id: projectId });
        if (!project) {
            next(commonItemNotFound("Project not found"));
        }
        
        const projectUser = await ProjectUserModel.findOne({ projectId: projectId, userId: userId });
        if (!projectUser) {
            next(commonItemNotFound("User not found for this project"));
        }

        const issues = await IssueModel.find({ created_by: userId, project_id: projectId });
        if (!issues) {
            next(commonItemNotFound("No issues found"));
        }
        commonConsole(issues, "Issues found :/projects-controller.js [getIssuesCreatedByUserForProject] 255");
        next(commonSuccess("Issues found", issues));
    }
    catch (error) {
        next(commonCatchBlock(error));
    }
}


module.exports = {
    getAllProject,
    getProject,
    createProject,
    updateProject,
    deleteProject,
    getProjectsForUser,
    assignUserToProject,
    removeUserFromProject,
    getProjectUsers,
    getIssuesCreatedByUserForProject
};


