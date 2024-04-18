const ProjectModel = require('../models/project-model');
const ProjectUserModel = require('../models/project-user-model');
const IssueModel = require('../models/issue-model');
const IssueCommentModel = require('../models/comment-model');
const IssueTrackerModel = require('../models/issue-tracker-model');
const commonConsole = require('../common/commonConsole');
const { commonSuccess, commonItemCreated, commonItemNotFound, commonCatchBlock, commonAlreadyExists } = require('../common/commonStatusCode');
const transporter = require('../common/emailConfigurationSetup');


// GET all project
const getAllProject = async (req, res, next) => {
    try {
        const project = await ProjectModel.find({ isDeleted: false }).populate({
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
        const project = await ProjectModel.findOne({ title: req.body.title, isDeleted: false });
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
        const project = await ProjectModel.findOne({ _id: projectId });
        if (!project) {
            next(commonItemNotFound("Project not found"));
        }
        // fetch all issue for this project and delete them
        const issues = await IssueModel.find({ project_id: projectId, isDeleted: false});
        if (issues) {
            
            for (let i = 0; i < issues.length; i++) {
                await IssueModel.findOneAndUpdate({ _id: issues[i]._id }, { isDeleted: true });
                // fetch all issue comments for this project and delete them
                const issueComments = await IssueCommentModel.find({ issue_id: issues[i]._id, isDeleted: false});
                if (issueComments) {
                    for (let i = 0; i < issueComments.length; i++) {
                        await IssueCommentModel.findOneAndUpdate({ _id: issueComments[i]._id }, { isDeleted: true });
                    }
                }
                // fetch all issue tracker for this project and delete them
                const issueTrackers = await IssueTrackerModel.find({ issue_id: issues[i]._id, isDeleted: false});
                if (issueTrackers) {
                    for (let i = 0; i < issueTrackers.length; i++) {
                        await IssueTrackerModel.findOneAndUpdate({ _id: issueTrackers[i]._id }, { isDeleted: true });
                    }
                }
            }
            // fetch all project users for this project and delete them
            const projectUsers = await ProjectUserModel.find({ projectId: projectId, isDeleted: false});
            if (projectUsers) {
                for (let i = 0; i < projectUsers.length; i++) {
                    await ProjectUserModel.findOneAndUpdate({ _id: projectUsers[i]._id }, { isDeleted: true });
                }
            }
        }

        await ProjectModel.findOneAndUpdate({ _id: projectId }, { isDeleted: true });

        commonConsole("Project deleted successfully :/projects-controller.js [deleteProject] 126");
        next(commonSuccess("Project deleted successfully", {}));
    } catch (error) {
        next(commonCatchBlock(error));
    }
};

// GET all projects for a user
const getProjectsForUser = async (req, res, next) => {
    try {
        const userId = req.params.userId;

        const projects = await ProjectModel.find({ created_by: userId, isDeleted: false });
        var flag1 = false;
        if (!projects) {
            flag1 = true;
        }

        // also get the projects where user is assigned
        const projectsAssigned = await ProjectUserModel.find({ userId: userId, isDeleted: false }).populate({
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
        const projectUsers = await ProjectUserModel.find({ projectId: projectId, isDeleted: false }).populate({
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

        const issues = await IssueModel.find({ created_by: userId, project_id: projectId, isDeleted: false});
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

const getProjectDetails = async (req, res, next) => {
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
            // get all issue tracker for this project
            const response = getIssueByProject(projectId);

            Promise.all([response]).then((values) => {
                const projectDetails = {
                    project: project,
                    graphData1: values[0].graphData1,
                    countUniqueUsers: values[0].countUniqueUsers,
                    issueCount: values[0].issueCount,
                    graphData2: values[0].graphData2
                }
                // commonConsole(projectDetails, "Project details found :/projects-controller.js [getProjectDetails] 296");
                next(commonSuccess("Project details found", projectDetails));
            }).catch((error) => {
                next(commonCatchBlock(error));
            });
        }).catch((error) => {
            next(commonCatchBlock(error));
        });
    } catch (error) {
        next(commonCatchBlock(error));
    }
};

async function getIssueByProject(p_id){
    try {
        const projectId = p_id;
        const project = await ProjectModel.findOne({ _id: projectId });
        if (!project) {
            return commonItemNotFound("Project not found");
        }
        const issues = await IssueModel.find({ project_id: projectId, isDeleted: false});
        const issueCount = issues.length;
        if (!issues) {
            return commonItemNotFound("No issues found");
        }
        var issueIds = [];
        for (var i = 0; i < issues.length; i++) {
            issueIds.push(issues[i]._id);
        }
        const issueTracker = await IssueTrackerModel.find({ issue_id: issueIds, isDeleted: false});
        const getUsers = [];
        for (var i = 0; i < issueTracker.length; i++) {
            if (!getUsers.includes(issueTracker[i].assigned_to)) {
                getUsers.push(issueTracker[i].assigned_to);
            }
        }
        const uniqueUsers = [...new Set(getUsers)]
        const countUniqueUsers = uniqueUsers.length;
        
        // calculate the number of issue tracker on each date
        var dateArray = [];
        var dateCount = [];
        for (var i = 0; i < issueTracker.length; i++) {
            var date = issueTracker[i].createdAt.toDateString();
            if (dateArray.includes(date)) {
                var index = dateArray.indexOf(date);
                dateCount[index] = dateCount[index] + 1;
            } else {
                dateArray.push(date);
                dateCount.push(1);
            }
        }
        var graphData1 = {};
        for (var i = 0; i < dateArray.length; i++) {
            // put in format of "mm/dd/yyyy"
            var tempDate = new Date(dateArray[i]);
            var month = tempDate.getMonth() + 1;
            var day = tempDate.getDate();
            var year = tempDate.getFullYear();
            var tempDateString = month + "/" + day + "/" + year;
            graphData1[tempDateString] = dateCount[i];
        }

        // calculate the number of issue created on each date
        var dateArray2 = [];
        var dateCount2 = [];
        for (var i = 0; i < issues.length; i++) {
            var date = issues[i].createdAt.toDateString();
            if (dateArray2.includes(date)) {
                var index = dateArray2.indexOf(date);
                dateCount2[index] = dateCount2[index] + 1;
            } else {
                dateArray2.push(date);
                dateCount2.push(1);
            }
        }
        var graphData2 = {};
        for (var i = 0; i < dateArray2.length; i++) {
            // put in format of "mm/dd/yyyy"
            var tempDate = new Date(dateArray2[i]);
            var month = tempDate.getMonth() + 1;
            var day = tempDate.getDate();
            var year = tempDate.getFullYear();
            var tempDateString = month + "/" + day + "/" + year;
            graphData2[tempDateString] = dateCount2[i];
        }
        return {graphData1, countUniqueUsers, issueCount, graphData2};
    } catch (error) {
        return commonCatchBlock(error);
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
    getIssuesCreatedByUserForProject,
    getProjectDetails
};


