import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
    createTask,
    getAllTasks,
    getTasksByAssignee,
    getTasksByCreator,
    getTasksByProject,
    getTaskById,
    updateTaskStatus,
    getUserById,
    getProjectById,
    createNotification,
    createComment,
    getCommentsByRelated,
    createFileAttachment,
    getFileAttachmentsByTask,
    getAllProjects
} from '../db';
import { CreateTaskData, TaskResponse, TasksResponse, UpdateTaskStatusData, CreateCommentData, CommentResponse, CommentsResponse, CreateFileAttachmentData, FileAttachmentResponse, FileAttachmentsResponse } from '@shared/api';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// GET /dashboard - Get dashboard data based on user role
router.get('/dashboard', authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        let tasks;
        let projects;

        if (user.role === 'project_manager') {
            // Project managers see tasks they created for their employees
            tasks = await getTasksByCreator(user.id);
            // Get projects managed by this project manager
            const allProjects = await getAllProjects();
            projects = allProjects.filter(project => project.project_manager === user.id);
        } else {
            // Employees see tasks assigned to them
            tasks = await getTasksByAssignee(user.id);
            // Get projects where employee has tasks
            const allProjects = await getAllProjects();
            const userProjectIds = [...new Set(tasks.filter(task => task.project_id).map(task => task.project_id))];
            projects = allProjects.filter(project => userProjectIds.includes(project.id));
        }

        // Calculate task statistics
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.status === 'completed' || task.status === 'approved').length;
        const inProgressTasks = tasks.filter(task => task.status === 'in_progress').length;
        const newTasks = tasks.filter(task => task.status === 'new_task').length;

        // Calculate project workload - tasks per project
        const projectWorkload = projects.map(project => {
            const projectTasks = tasks.filter(task => task.project_id === project.id);
            const completedProjectTasks = projectTasks.filter(task => task.status === 'completed' || task.status === 'approved').length;

            return {
                project_id: project.id,
                project_name: project.name,
                total_tasks: projectTasks.length,
                completed_tasks: completedProjectTasks,
                progress_percentage: projectTasks.length > 0 ? Math.round((completedProjectTasks / projectTasks.length) * 100) : 0,
                deadline: project.deadline,
                priority: project.priority
            };
        });

        // Get today's tasks (due today or overdue)
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        const todaysTasks = tasks.filter(task => {
            const taskDeadline = new Date(task.deadline);
            return taskDeadline <= today;
        });

        const dashboardData = {
            success: true,
            message: 'Dashboard data retrieved successfully',
            data: {
                user_role: user.role,
                tasks: {
                    total: totalTasks,
                    completed: completedTasks,
                    in_progress: inProgressTasks,
                    new_tasks: newTasks,
                    today_tasks: todaysTasks,
                    recent_tasks: tasks.slice(0, 10) // Get 10 most recent tasks
                },
                projects: {
                    total: projects.length,
                    workload: projectWorkload
                }
            }
        };

        res.json(dashboardData);
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard data'
        });
    }
});

// Get all tasks (for project managers) or user's tasks (for employees)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        let tasks;
        if (user.role === 'project_manager') {
            // Project managers can see all tasks they created
            tasks = await getTasksByCreator(user.id);
        } else {
            // Employees can only see tasks assigned to them
            tasks = await getTasksByAssignee(user.id);
        }

        const response: TasksResponse = {
            success: true,
            message: 'Tasks retrieved successfully',
            tasks: tasks
        };

        res.json(response);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch tasks'
        });
    }
});

// Get tasks by project ID
router.get('/project/:projectId', authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        const { projectId } = req.params;

        if (!user) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        // Verify project exists and user has access
        const project = await getProjectById(projectId);
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        // For employees, only show tasks assigned to them in this project
        // For project managers, show all tasks in projects they manage
        let tasks;
        if (user.role === 'project_manager' && project.project_manager === user.id) {
            tasks = await getTasksByProject(projectId);
        } else {
            // Get all tasks for this project but filter by assignee
            const allProjectTasks = await getTasksByProject(projectId);
            tasks = allProjectTasks.filter(task => task.assignee === user.id);
        }

        const response: TasksResponse = {
            success: true,
            message: 'Project tasks retrieved successfully',
            tasks: tasks
        };

        res.json(response);
    } catch (error) {
        console.error('Error fetching project tasks:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch project tasks'
        });
    }
});

// Get task by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        const { id } = req.params;

        if (!user) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        const task = await getTaskById(id);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        // Check if user has access to this task
        const hasAccess =
            task.assignee === user.id ||
            task.created_by === user.id ||
            user.role === 'project_manager';

        if (!hasAccess) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const response: TaskResponse = {
            success: true,
            message: 'Task retrieved successfully',
            task: task
        };

        res.json(response);
    } catch (error) {
        console.error('Error fetching task:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch task'
        });
    }
});

// Create new task (project managers only)
router.post('/', authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        if (user.role !== 'project_manager') {
            return res.status(403).json({ success: false, message: 'Only project managers can create tasks' });
        }

        const taskData: CreateTaskData = req.body;

        // Validate required fields
        if (!taskData.name || !taskData.description || !taskData.assignee || !taskData.deadline) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: name, description, assignee, deadline'
            });
        }

        // Verify assignee exists
        const assignee = await getUserById(taskData.assignee);
        if (!assignee) {
            return res.status(400).json({ success: false, message: 'Assignee not found' });
        }

        // If project_id is provided, verify it exists and user is the manager
        if (taskData.project_id) {
            const project = await getProjectById(taskData.project_id);
            if (!project) {
                return res.status(400).json({ success: false, message: 'Project not found' });
            }
            if (project.project_manager !== user.id) {
                return res.status(403).json({ success: false, message: 'You can only create tasks for projects you manage' });
            }
        }

        const taskId = uuidv4();
        const deadline = new Date(taskData.deadline);

        const newTask = await createTask({
            ...taskData,
            id: taskId,
            created_by: user.id,
            deadline: deadline
        });

        // Create notification for the assignee
        try {
            const notificationId = uuidv4();
            await createNotification({
                id: notificationId,
                user_id: taskData.assignee,
                type: 'task_assigned',
                title: 'New Task Assigned',
                message: `You have been assigned a new task: "${taskData.name}". Due date: ${deadline.toLocaleDateString()}.`,
                related_id: taskId,
                related_type: 'task'
            });
            console.log(`✅ Notification sent to user ${taskData.assignee} for task assignment`);
        } catch (notificationError) {
            console.error('Error creating notification:', notificationError);
            // Don't fail task creation if notification fails
        }

        const response: TaskResponse = {
            success: true,
            message: 'Task created successfully',
            task: newTask
        };

        res.status(201).json(response);
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create task'
        });
    }
});

// Update task status (employees can update their own tasks)
router.patch('/:id/status', authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        const { id } = req.params;
        const updateData: UpdateTaskStatusData = req.body;

        if (!user) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        if (!updateData.status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required'
            });
        }

        // Validate status
        const validStatuses = ['new_task', 'in_progress', 'completed', 'approved'];
        if (!validStatuses.includes(updateData.status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
            });
        }

        // Get the task first to check permissions
        const task = await getTaskById(id);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        // Only assignee can update task status, except for 'approved' which only project manager can set
        if (updateData.status === 'approved') {
            if (user.role !== 'project_manager' || task.created_by !== user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'Only the project manager who created this task can approve it'
                });
            }
            // Update task status (for project manager approval)
            const updatedTask = await updateTaskStatus(id, updateData.status, task.assignee);
            if (!updatedTask) {
                return res.status(500).json({ success: false, message: 'Failed to update task status' });
            }
        } else {
            if (task.assignee !== user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'You can only update the status of tasks assigned to you'
                });
            }
            // Update task status
            const updatedTask = await updateTaskStatus(id, updateData.status, user.id);
            if (!updatedTask) {
                return res.status(500).json({ success: false, message: 'Failed to update task status' });
            }
        }

        // Fetch updated task with all relations
        const updatedTaskWithDetails = await getTaskById(id);

        const response: TaskResponse = {
            success: true,
            message: 'Task status updated successfully',
            task: updatedTaskWithDetails
        };

        res.json(response);
    } catch (error) {
        console.error('Error updating task status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update task status'
        });
    }
});

// GET /tasks/:id/comments - Get comments for a task
router.get('/:id/comments', authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        const { id } = req.params;

        if (!user) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        const task = await getTaskById(id);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        // Check if user has access to this task
        const hasAccess =
            task.assignee === user.id ||
            task.created_by === user.id ||
            user.role === 'project_manager';

        if (!hasAccess) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const comments = await getCommentsByRelated(id, 'task');

        const response: CommentsResponse = {
            success: true,
            message: 'Comments retrieved successfully',
            comments: comments
        };

        res.json(response);
    } catch (error) {
        console.error('Error fetching task comments:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch task comments'
        });
    }
});

// POST /tasks/:id/comments - Add a comment to a task
router.post('/:id/comments', authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        const { id } = req.params;
        const { content }: { content: string } = req.body;

        if (!user) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        if (!content || content.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Comment content is required'
            });
        }

        const task = await getTaskById(id);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        // Check if user has access to this task
        const hasAccess =
            task.assignee === user.id ||
            task.created_by === user.id ||
            user.role === 'project_manager';

        if (!hasAccess) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const commentId = uuidv4();
        const comment = await createComment({
            id: commentId,
            content: content.trim(),
            author_id: user.id,
            related_id: id,
            related_type: 'task'
        });

        // Fetch comment with author name
        const comments = await getCommentsByRelated(id, 'task');
        const createdComment = comments.find(c => c.id === commentId);

        const response: CommentResponse = {
            success: true,
            message: 'Comment added successfully',
            comment: createdComment
        };

        res.status(201).json(response);
    } catch (error) {
        console.error('Error adding task comment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add task comment'
        });
    }
});

// GET /tasks/:id/files - Get file attachments for a task
router.get('/:id/files', authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        const { id } = req.params;

        if (!user) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        const task = await getTaskById(id);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        // Check if user has access to this task
        const hasAccess =
            task.assignee === user.id ||
            task.created_by === user.id ||
            user.role === 'project_manager';

        if (!hasAccess) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const files = await getFileAttachmentsByTask(id);

        const response: FileAttachmentsResponse = {
            success: true,
            message: 'File attachments retrieved successfully',
            files: files
        };

        res.json(response);
    } catch (error) {
        console.error('Error fetching task files:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch task files'
        });
    }
});

// POST /tasks/:id/files - Upload a file attachment to a task
router.post('/:id/files', authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        const { id } = req.params;
        const fileData: CreateFileAttachmentData = req.body;

        console.log(`File upload attempt for task ${id} by user ${user?.id}`);
        console.log('File data received:', {
            file_name: fileData?.file_name,
            file_size: fileData?.file_size,
            mime_type: fileData?.mime_type,
            has_url: !!fileData?.file_url
        });

        if (!user) {
            console.log('File upload failed: User not authenticated');
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        // Validate required fields
        if (!fileData.file_name || !fileData.file_url || !fileData.file_size || !fileData.mime_type) {
            console.log('File upload failed: Missing required fields');
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: file_name, file_url, file_size, mime_type'
            });
        }

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (fileData.file_size > maxSize) {
            console.log(`File upload failed: File too large (${fileData.file_size} bytes)`);
            return res.status(400).json({
                success: false,
                message: 'File size must be less than 10MB'
            });
        }

        const task = await getTaskById(id);
        if (!task) {
            console.log(`File upload failed: Task ${id} not found`);
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        // Check if user has access to this task (only assignee can upload files)
        if (task.assignee !== user.id) {
            console.log(`File upload failed: User ${user.id} not assignee of task ${id} (assignee: ${task.assignee})`);
            return res.status(403).json({
                success: false,
                message: 'Only the task assignee can upload files'
            });
        }

        const fileId = uuidv4();
        console.log(`Creating file attachment with ID: ${fileId}`);

        const fileAttachment = await createFileAttachment({
            ...fileData,
            id: fileId,
            task_id: id,
            uploaded_by: user.id
        });

        console.log('File attachment created successfully:', fileAttachment.id);

        // Fetch file with uploader name
        const files = await getFileAttachmentsByTask(id);
        const createdFile = files.find(f => f.id === fileId);

        if (!createdFile) {
            console.log('Warning: Created file not found in subsequent fetch');
            return res.status(500).json({
                success: false,
                message: 'File uploaded but could not be retrieved'
            });
        }

        const response: FileAttachmentResponse = {
            success: true,
            message: 'File uploaded successfully',
            file: createdFile
        };

        console.log('File upload successful:', createdFile.file_name);
        res.status(201).json(response);
    } catch (error) {
        console.error('Error uploading task file:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while uploading file'
        });
    }
});

export default router;