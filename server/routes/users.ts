import express, { RequestHandler } from 'express';
import { UserProfileResponse, AllUsersResponse, UpdateUserProfileData, ProjectsResponse, TasksResponse } from '@shared/api';
import { getUserById, getAllUsers, updateUserProfile, emailExists, getAllProjects, getTasksByAssignee, getTasksByCreator } from '../db';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/users/:id - Get user profile by ID
export const getUserProfile: RequestHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUser = req.user!;

        // Users can view their own profile, project managers can view any profile
        if (currentUser.id !== id && currentUser.role !== 'project_manager') {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to view this profile'
            } as UserProfileResponse);
        }

        const user = await getUserById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            } as UserProfileResponse);
        }

        res.json({
            success: true,
            message: 'User profile retrieved successfully',
            user
        } as UserProfileResponse);

    } catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        } as UserProfileResponse);
    }
};

// GET /api/users - Get all users (project managers only)
export const getAllUsersHandler: RequestHandler = async (req, res) => {
    try {
        const currentUser = req.user!;

        // Only project managers can view all users
        if (currentUser.role !== 'project_manager') {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized - project manager access required'
            } as AllUsersResponse);
        }

        const users = await getAllUsers();

        res.json({
            success: true,
            message: 'Users retrieved successfully',
            users
        } as AllUsersResponse);

    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        } as AllUsersResponse);
    }
};

// PUT /api/users/:id - Update user profile
export const updateUserProfileHandler: RequestHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUser = req.user!;
        const updateData: UpdateUserProfileData = req.body;

        // Users can edit their own profile, project managers can edit any profile
        if (currentUser.id !== id && currentUser.role !== 'project_manager') {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to edit this profile'
            } as UserProfileResponse);
        }

        // Validate email uniqueness if email is being updated
        if (updateData.email) {
            const currentUserData = await getUserById(id);
            if (currentUserData && currentUserData.email !== updateData.email) {
                const emailInUse = await emailExists(updateData.email);
                if (emailInUse) {
                    return res.status(400).json({
                        success: false,
                        message: 'Email is already in use by another user'
                    } as UserProfileResponse);
                }
            }
        }

        const updatedUser = await updateUserProfile(id, updateData, currentUser.role);
        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            } as UserProfileResponse);
        }

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: updatedUser
        } as UserProfileResponse);

    } catch (error) {
        console.error('Update user profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        } as UserProfileResponse);
    }
};

// GET /api/users/:id/projects - Get projects for a specific user (project managers only)
export const getUserProjects: RequestHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUser = req.user!;

        // Only project managers can view user projects
        if (currentUser.role !== 'project_manager') {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized - project manager access required'
            } as ProjectsResponse);
        }

        // Get all projects and filter based on user's role
        const allProjects = await getAllProjects();
        let userProjects;

        // Check if target user exists
        const targetUser = await getUserById(id);
        if (!targetUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            } as ProjectsResponse);
        }

        if (targetUser.role === 'project_manager') {
            // If target is project manager, show projects they manage
            userProjects = allProjects.filter(project => project.project_manager === id);
        } else {
            // If target is employee, show projects where they have assigned tasks
            const userTasks = await getTasksByAssignee(id);
            const projectIds = [...new Set(userTasks.filter(task => task.project_id).map(task => task.project_id))];
            userProjects = allProjects.filter(project => projectIds.includes(project.id));
        }

        res.json({
            success: true,
            message: 'User projects retrieved successfully',
            projects: userProjects
        } as ProjectsResponse);

    } catch (error) {
        console.error('Get user projects error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        } as ProjectsResponse);
    }
};

// GET /api/users/:id/tasks - Get tasks for a specific user (project managers only)
export const getUserTasks: RequestHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUser = req.user!;

        // Only project managers can view user tasks
        if (currentUser.role !== 'project_manager') {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized - project manager access required'
            } as TasksResponse);
        }

        // Check if target user exists
        const targetUser = await getUserById(id);
        if (!targetUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            } as TasksResponse);
        }

        let userTasks;

        if (targetUser.role === 'project_manager') {
            // If target is project manager, show tasks they created
            userTasks = await getTasksByCreator(id);
        } else {
            // If target is employee, show tasks assigned to them
            userTasks = await getTasksByAssignee(id);
        }

        res.json({
            success: true,
            message: 'User tasks retrieved successfully',
            tasks: userTasks
        } as TasksResponse);

    } catch (error) {
        console.error('Get user tasks error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        } as TasksResponse);
    }
};

// Routes
router.get('/users/:id', getUserProfile);
router.get('/users/:id/projects', getUserProjects);
router.get('/users/:id/tasks', getUserTasks);
router.get('/users', getAllUsersHandler);
router.put('/users/:id', updateUserProfileHandler);

export default router;