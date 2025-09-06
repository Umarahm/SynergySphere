import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { getAllProjects, createProject, getProjectById, getUsersByRole, updateProject, createComment, getCommentsByRelated } from '../db';
import { CreateProjectData, ProjectResponse, ProjectsResponse, User, UpdateProjectData, CreateCommentData, CommentResponse, CommentsResponse } from '@shared/api';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GET /projects - Get all projects for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const projects = await getAllProjects();

        res.json({
            success: true,
            message: 'Projects retrieved successfully',
            projects: projects
        } as ProjectsResponse);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        } as ProjectsResponse);
    }
});

// POST /projects - Create a new project (project managers only)
router.post('/', authenticateToken, async (req, res) => {
    try {
        const user = req.user as User;

        // Check if user is a project manager
        if (user.role !== 'project_manager') {
            return res.status(403).json({
                success: false,
                message: 'Only project managers can create projects'
            } as ProjectResponse);
        }

        const projectData: CreateProjectData = req.body;

        // Validate required fields
        if (!projectData.name || !projectData.description || !projectData.project_manager || !projectData.deadline) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: name, description, project_manager, deadline'
            } as ProjectResponse);
        }

        // Validate deadline is in the future
        const deadline = new Date(projectData.deadline);
        if (deadline <= new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Deadline must be in the future'
            } as ProjectResponse);
        }

        // Validate priority
        if (!['low', 'medium', 'high'].includes(projectData.priority)) {
            return res.status(400).json({
                success: false,
                message: 'Priority must be low, medium, or high'
            } as ProjectResponse);
        }

        // Verify project manager exists
        const projectManagers = await getUsersByRole('project_manager');
        const projectManagerExists = projectManagers.find(pm => pm.id === projectData.project_manager);

        if (!projectManagerExists) {
            return res.status(400).json({
                success: false,
                message: 'Invalid project manager'
            } as ProjectResponse);
        }

        // Generate project ID
        const projectId = Math.random().toString(36).substring(2) + Date.now().toString(36);

        // Create project
        const project = await createProject({
            ...projectData,
            id: projectId,
            deadline: deadline
        });

        res.status(201).json({
            success: true,
            message: 'Project created successfully',
            project: project
        } as ProjectResponse);
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        } as ProjectResponse);
    }
});

// GET /projects/:id - Get a specific project
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const project = await getProjectById(id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            } as ProjectResponse);
        }

        res.json({
            success: true,
            message: 'Project retrieved successfully',
            project: project
        } as ProjectResponse);
    } catch (error) {
        console.error('Error fetching project:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        } as ProjectResponse);
    }
});

// PUT /projects/:id - Update a project (project managers only)
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const user = req.user as User;
        const { id } = req.params;
        const updateData: UpdateProjectData = req.body;

        // Check if user is a project manager
        if (user.role !== 'project_manager') {
            return res.status(403).json({
                success: false,
                message: 'Only project managers can update projects'
            } as ProjectResponse);
        }

        // Validate completion percentage if provided
        if (updateData.completion_percentage !== undefined) {
            if (updateData.completion_percentage < 0 || updateData.completion_percentage > 100) {
                return res.status(400).json({
                    success: false,
                    message: 'Completion percentage must be between 0 and 100'
                } as ProjectResponse);
            }
        }

        // Validate deadline if provided
        if (updateData.deadline) {
            const deadline = new Date(updateData.deadline);
            if (deadline <= new Date()) {
                return res.status(400).json({
                    success: false,
                    message: 'Deadline must be in the future'
                } as ProjectResponse);
            }
            updateData.deadline = deadline;
        }

        // Validate priority if provided
        if (updateData.priority && !['low', 'medium', 'high'].includes(updateData.priority)) {
            return res.status(400).json({
                success: false,
                message: 'Priority must be low, medium, or high'
            } as ProjectResponse);
        }

        const updatedProject = await updateProject(id, updateData, user.id);

        if (!updatedProject) {
            return res.status(404).json({
                success: false,
                message: 'Project not found or you do not have permission to update it'
            } as ProjectResponse);
        }

        res.json({
            success: true,
            message: 'Project updated successfully',
            project: updatedProject
        } as ProjectResponse);
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        } as ProjectResponse);
    }
});

// GET /projects/:id/comments - Get comments for a project
router.get('/:id/comments', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        // Verify project exists
        const project = await getProjectById(id);
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            } as CommentsResponse);
        }

        const comments = await getCommentsByRelated(id, 'project');

        res.json({
            success: true,
            message: 'Comments retrieved successfully',
            comments: comments
        } as CommentsResponse);
    } catch (error) {
        console.error('Error fetching project comments:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        } as CommentsResponse);
    }
});

// POST /projects/:id/comments - Add a comment to a project
router.post('/:id/comments', authenticateToken, async (req, res) => {
    try {
        const user = req.user as User;
        const { id } = req.params;
        const { content }: { content: string } = req.body;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Comment content is required'
            } as CommentResponse);
        }

        // Verify project exists
        const project = await getProjectById(id);
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            } as CommentResponse);
        }

        const commentId = uuidv4();
        const comment = await createComment({
            id: commentId,
            content: content.trim(),
            author_id: user.id,
            related_id: id,
            related_type: 'project'
        });

        // Fetch comment with author name
        const comments = await getCommentsByRelated(id, 'project');
        const createdComment = comments.find(c => c.id === commentId);

        res.status(201).json({
            success: true,
            message: 'Comment added successfully',
            comment: createdComment
        } as CommentResponse);
    } catch (error) {
        console.error('Error adding project comment:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        } as CommentResponse);
    }
});

export default router;