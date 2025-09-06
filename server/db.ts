import { neon } from '@neondatabase/serverless';
import { User, CreateUserData, Project, CreateProjectData, UpdateProjectData, Task, CreateTaskData, TaskStatus, UpdateTaskStatusData, Notification, CreateNotificationData, NotificationType, Comment, CreateCommentData, FileAttachment, CreateFileAttachmentData, UpdateUserProfileData, ChatMessage, CreateChatMessageData, ChatFileAttachment, CreateChatFileAttachmentData, TimeLog, CreateTimeLogData } from '@shared/api';

// Initialize Neon client
const sql = neon(process.env.DATABASE_URL!);

// Database initialization
export async function initializeDatabase() {
  try {
    // Create users table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(100) DEFAULT 'user',
        phone VARCHAR(20),
        department VARCHAR(255),
        bio TEXT,
        avatar_url TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Create projects table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS projects (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(500) NOT NULL,
        description TEXT NOT NULL,
        tags TEXT, -- JSON array stored as text
        project_manager UUID NOT NULL,
        deadline TIMESTAMP NOT NULL,
        priority VARCHAR(50) NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
        image_url TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (project_manager) REFERENCES users(id)
      )
    `;

    // Create tasks table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS tasks (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(500) NOT NULL,
        description TEXT NOT NULL,
        assignee UUID NOT NULL,
        project_id VARCHAR(255),
        tags TEXT, -- JSON array stored as text
        deadline TIMESTAMP NOT NULL,
        image_url TEXT,
        status VARCHAR(50) NOT NULL DEFAULT 'new_task' CHECK (status IN ('new_task', 'in_progress', 'completed', 'approved')),
        created_by UUID NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (assignee) REFERENCES users(id),
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `;

    // Create notifications table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        type VARCHAR(50) NOT NULL CHECK (type IN ('task_assigned', 'task_completed', 'task_approved', 'project_created', 'deadline_reminder')),
        title VARCHAR(500) NOT NULL,
        message TEXT NOT NULL,
        related_id VARCHAR(255),
        related_type VARCHAR(50) CHECK (related_type IN ('task', 'project')),
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;

    // Create comments table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS comments (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
        content TEXT NOT NULL,
        author_id UUID NOT NULL,
        related_id VARCHAR(255) NOT NULL,
        related_type VARCHAR(50) NOT NULL CHECK (related_type IN ('project', 'task')),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;

    // Create file_attachments table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS file_attachments (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
        file_name VARCHAR(500) NOT NULL,
        file_url TEXT NOT NULL,
        file_size BIGINT NOT NULL,
        mime_type VARCHAR(255) NOT NULL,
        task_id VARCHAR(255) NOT NULL,
        uploaded_by UUID NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
        FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
      )
    `;

    // Create chat_messages table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
        content TEXT NOT NULL,
        sender_id UUID NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;

    // Create chat_file_attachments table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS chat_file_attachments (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
        file_name VARCHAR(500) NOT NULL,
        file_url TEXT NOT NULL,
        file_size BIGINT NOT NULL,
        mime_type VARCHAR(255) NOT NULL,
        message_id VARCHAR(255) NOT NULL,
        uploaded_by UUID NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (message_id) REFERENCES chat_messages(id) ON DELETE CASCADE,
        FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
      )
    `;

    // Create login_logs table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS login_logs (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        login_timestamp TIMESTAMP DEFAULT NOW(),
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;

    // Add profile fields to users table if they don't exist
    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
      ADD COLUMN IF NOT EXISTS department VARCHAR(255),
      ADD COLUMN IF NOT EXISTS bio TEXT,
      ADD COLUMN IF NOT EXISTS avatar_url TEXT
    `;

    // Add completion_percentage column to projects if it doesn't exist
    await sql`
      ALTER TABLE projects 
      ADD COLUMN IF NOT EXISTS completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100)
    `;

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

// User database operations
export async function createUser(userData: CreateUserData & { password_hash: string }): Promise<User> {
  const result = await sql`
    INSERT INTO users (email, password_hash, name, role)
    VALUES (${userData.email}, ${userData.password_hash}, ${userData.name}, ${userData.role || 'user'})
    RETURNING id, email, name, role, created_at
  `;

  return result[0] as User;
}

export async function getUserByEmail(email: string): Promise<(User & { password_hash: string }) | null> {
  const result = await sql`
    SELECT id, email, password_hash, name, role, created_at
    FROM users
    WHERE email = ${email}
  `;

  return result[0] as (User & { password_hash: string }) || null;
}

export async function getUserById(id: string): Promise<User | null> {
  const result = await sql`
    SELECT id, email, name, role, phone, department, bio, avatar_url, created_at
    FROM users
    WHERE id = ${id}
  `;

  return result[0] as User || null;
}

export async function emailExists(email: string): Promise<boolean> {
  const result = await sql`
    SELECT 1 FROM users WHERE email = ${email} LIMIT 1
  `;

  return result.length > 0;
}

export async function getUsersByRole(role: string): Promise<User[]> {
  const result = await sql`
    SELECT id, email, name, role, phone, department, bio, avatar_url, created_at
    FROM users
    WHERE role = ${role}
    ORDER BY name
  `;

  return result as User[];
}

// Get all users (for project managers)
export async function getAllUsers(): Promise<User[]> {
  const result = await sql`
    SELECT id, email, name, role, phone, department, bio, avatar_url, created_at
    FROM users
    ORDER BY name
  `;

  return result as User[];
}

// Update user profile
export async function updateUserProfile(userId: string, updateData: UpdateUserProfileData, updaterRole?: string): Promise<User | null> {
  // If no fields to update, return current user
  if (!updateData || Object.keys(updateData).length === 0) {
    return getUserById(userId);
  }

  try {
    // Get current user data first
    const currentUser = await getUserById(userId);
    if (!currentUser) return null;

    // Apply updates field by field using Neon's template literal syntax
    let result;

    // Build the update query using template literals with conditional fields
    const updatedFields = {
      name: updateData.name !== undefined ? updateData.name : currentUser.name,
      email: updateData.email !== undefined ? updateData.email : currentUser.email,
      phone: updateData.phone !== undefined ? updateData.phone : currentUser.phone,
      department: updateData.department !== undefined ? updateData.department : currentUser.department,
      bio: updateData.bio !== undefined ? updateData.bio : currentUser.bio,
      avatar_url: updateData.avatar_url !== undefined ? updateData.avatar_url : currentUser.avatar_url
    };

    console.log('Updating user profile with fields:', updatedFields);

    result = await sql`
      UPDATE users 
      SET 
        name = ${updatedFields.name},
        email = ${updatedFields.email},
        phone = ${updatedFields.phone},
        department = ${updatedFields.department},
        bio = ${updatedFields.bio},
        avatar_url = ${updatedFields.avatar_url}
      WHERE id = ${userId}
      RETURNING id, email, name, role, phone, department, bio, avatar_url, created_at
    `;

    if (result.length === 0) return null;
    return result[0] as User;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

// Project database operations
export async function createProject(projectData: CreateProjectData & { id: string }): Promise<Project> {
  const result = await sql`
    INSERT INTO projects (id, name, description, tags, project_manager, deadline, priority, image_url, completion_percentage)
    VALUES (
      ${projectData.id},
      ${projectData.name},
      ${projectData.description},
      ${JSON.stringify(projectData.tags || [])},
      ${projectData.project_manager},
      ${projectData.deadline.toISOString()},
      ${projectData.priority},
      ${projectData.image_url || null},
      ${projectData.completion_percentage || 0}
    )
    RETURNING *
  `;

  const project = result[0] as any;
  if (project.tags) {
    project.tags = JSON.parse(project.tags);
  }
  return project as Project;
}

export async function getProjectById(id: string): Promise<Project | null> {
  const result = await sql`
    SELECT 
      p.*,
      u.name as project_manager_name
    FROM projects p
    LEFT JOIN users u ON p.project_manager = u.id
    WHERE p.id = ${id}
  `;

  if (result.length === 0) return null;

  const project = result[0] as any;
  if (project.tags) {
    project.tags = JSON.parse(project.tags);
  }
  return project as Project;
}

export async function getAllProjects(): Promise<Project[]> {
  const result = await sql`
    SELECT 
      p.*,
      u.name as project_manager_name
    FROM projects p
    LEFT JOIN users u ON p.project_manager = u.id
    ORDER BY p.created_at DESC
  `;

  return result.map((project: any) => {
    if (project.tags) {
      project.tags = JSON.parse(project.tags);
    }
    return project as Project;
  });
}

// Notification database operations
export async function createNotification(notificationData: CreateNotificationData & { id: string }): Promise<Notification> {
  const result = await sql`
    INSERT INTO notifications (id, user_id, type, title, message, related_id, related_type)
    VALUES (
      ${notificationData.id},
      ${notificationData.user_id},
      ${notificationData.type},
      ${notificationData.title},
      ${notificationData.message},
      ${notificationData.related_id || null},
      ${notificationData.related_type || null}
    )
    RETURNING *
  `;

  return result[0] as Notification;
}

export async function getNotificationsByUser(userId: string, limit = 50): Promise<Notification[]> {
  const result = await sql`
    SELECT *
    FROM notifications
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;

  return result as Notification[];
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const result = await sql`
    SELECT COUNT(*) as count
    FROM notifications
    WHERE user_id = ${userId} AND is_read = FALSE
  `;

  return parseInt(result[0].count) || 0;
}

export async function markNotificationAsRead(notificationId: string, userId: string): Promise<boolean> {
  const result = await sql`
    UPDATE notifications
    SET is_read = TRUE, updated_at = NOW()
    WHERE id = ${notificationId} AND user_id = ${userId}
    RETURNING id
  `;

  return result.length > 0;
}

export async function markAllNotificationsAsRead(userId: string): Promise<number> {
  const result = await sql`
    UPDATE notifications
    SET is_read = TRUE, updated_at = NOW()
    WHERE user_id = ${userId} AND is_read = FALSE
    RETURNING id
  `;

  return result.length;
}

// Task database operations
export async function createTask(taskData: CreateTaskData & { id: string; created_by: string }): Promise<Task> {
  const result = await sql`
    INSERT INTO tasks (id, name, description, assignee, project_id, tags, deadline, image_url, created_by)
    VALUES (
      ${taskData.id},
      ${taskData.name},
      ${taskData.description},
      ${taskData.assignee},
      ${taskData.project_id || null},
      ${JSON.stringify(taskData.tags || [])},
      ${taskData.deadline.toISOString()},
      ${taskData.image_url || null},
      ${taskData.created_by}
    )
    RETURNING *
  `;

  const task = result[0] as any;
  if (task.tags) {
    task.tags = JSON.parse(task.tags);
  }
  return task as Task;
}

export async function getTaskById(id: string): Promise<Task | null> {
  const result = await sql`
    SELECT 
      t.*,
      u1.name as assignee_name,
      u2.name as created_by_name,
      p.name as project_name
    FROM tasks t
    LEFT JOIN users u1 ON t.assignee = u1.id
    LEFT JOIN users u2 ON t.created_by = u2.id
    LEFT JOIN projects p ON t.project_id = p.id
    WHERE t.id = ${id}
  `;

  if (result.length === 0) return null;

  const task = result[0] as any;
  if (task.tags) {
    task.tags = JSON.parse(task.tags);
  }
  return task as Task;
}

export async function getAllTasks(): Promise<Task[]> {
  const result = await sql`
    SELECT 
      t.*,
      u1.name as assignee_name,
      u2.name as created_by_name,
      p.name as project_name
    FROM tasks t
    LEFT JOIN users u1 ON t.assignee = u1.id
    LEFT JOIN users u2 ON t.created_by = u2.id
    LEFT JOIN projects p ON t.project_id = p.id
    ORDER BY t.created_at DESC
  `;

  return result.map((task: any) => {
    if (task.tags) {
      task.tags = JSON.parse(task.tags);
    }
    return task as Task;
  });
}

export async function getTasksByAssignee(assigneeId: string): Promise<Task[]> {
  const result = await sql`
    SELECT 
      t.*,
      u1.name as assignee_name,
      u2.name as created_by_name,
      p.name as project_name
    FROM tasks t
    LEFT JOIN users u1 ON t.assignee = u1.id
    LEFT JOIN users u2 ON t.created_by = u2.id
    LEFT JOIN projects p ON t.project_id = p.id
    WHERE t.assignee = ${assigneeId}
    ORDER BY t.created_at DESC
  `;

  return result.map((task: any) => {
    if (task.tags) {
      task.tags = JSON.parse(task.tags);
    }
    return task as Task;
  });
}

export async function getTasksByCreator(creatorId: string): Promise<Task[]> {
  const result = await sql`
    SELECT 
      t.*,
      u1.name as assignee_name,
      u2.name as created_by_name,
      p.name as project_name
    FROM tasks t
    LEFT JOIN users u1 ON t.assignee = u1.id
    LEFT JOIN users u2 ON t.created_by = u2.id
    LEFT JOIN projects p ON t.project_id = p.id
    WHERE t.created_by = ${creatorId}
    ORDER BY t.created_at DESC
  `;

  return result.map((task: any) => {
    if (task.tags) {
      task.tags = JSON.parse(task.tags);
    }
    return task as Task;
  });
}

export async function getTasksByProject(projectId: string): Promise<Task[]> {
  const result = await sql`
    SELECT 
      t.*,
      u1.name as assignee_name,
      u2.name as created_by_name,
      p.name as project_name
    FROM tasks t
    LEFT JOIN users u1 ON t.assignee = u1.id
    LEFT JOIN users u2 ON t.created_by = u2.id
    LEFT JOIN projects p ON t.project_id = p.id
    WHERE t.project_id = ${projectId}
    ORDER BY t.created_at DESC
  `;

  return result.map((task: any) => {
    if (task.tags) {
      task.tags = JSON.parse(task.tags);
    }
    return task as Task;
  });
}

export async function updateTaskStatus(taskId: string, status: TaskStatus, userId: string): Promise<Task | null> {
  const result = await sql`
    UPDATE tasks 
    SET status = ${status}, updated_at = NOW()
    WHERE id = ${taskId} AND assignee = ${userId}
    RETURNING *
  `;

  if (result.length === 0) return null;

  const task = result[0] as any;
  if (task.tags) {
    task.tags = JSON.parse(task.tags);
  }
  return task as Task;
}

export async function getProjectsByManager(managerId: string): Promise<Project[]> {
  const result = await sql`
    SELECT 
      p.*,
      u.name as project_manager_name
    FROM projects p
    LEFT JOIN users u ON p.project_manager = u.id
    WHERE p.project_manager = ${managerId}
    ORDER BY p.created_at DESC
  `;

  return result.map((project: any) => {
    if (project.tags) {
      project.tags = JSON.parse(project.tags);
    }
    return project as Project;
  });
}

// Project update functions
export async function updateProject(projectId: string, updateData: UpdateProjectData, managerId: string): Promise<Project | null> {
  const updateFields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (updateData.name !== undefined) {
    updateFields.push(`name = $${paramIndex}`);
    values.push(updateData.name);
    paramIndex++;
  }
  if (updateData.description !== undefined) {
    updateFields.push(`description = $${paramIndex}`);
    values.push(updateData.description);
    paramIndex++;
  }
  if (updateData.tags !== undefined) {
    updateFields.push(`tags = $${paramIndex}`);
    values.push(JSON.stringify(updateData.tags));
    paramIndex++;
  }
  if (updateData.deadline !== undefined) {
    updateFields.push(`deadline = $${paramIndex}`);
    values.push(updateData.deadline.toISOString());
    paramIndex++;
  }
  if (updateData.priority !== undefined) {
    updateFields.push(`priority = $${paramIndex}`);
    values.push(updateData.priority);
    paramIndex++;
  }
  if (updateData.image_url !== undefined) {
    updateFields.push(`image_url = $${paramIndex}`);
    values.push(updateData.image_url);
    paramIndex++;
  }
  if (updateData.completion_percentage !== undefined) {
    updateFields.push(`completion_percentage = $${paramIndex}`);
    values.push(updateData.completion_percentage);
    paramIndex++;
  }

  if (updateFields.length === 0) {
    return null; // No fields to update
  }

  updateFields.push(`updated_at = NOW()`);
  values.push(projectId, managerId);

  // Use the native sql template literal approach instead of sql.unsafe
  const setClause = updateFields.join(', ');

  // Since we can't dynamically build template literals, we'll use a different approach
  const result = await sql`
    UPDATE projects 
    SET name = COALESCE(${updateData.name || null}, name),
        description = COALESCE(${updateData.description || null}, description),
        tags = COALESCE(${updateData.tags ? JSON.stringify(updateData.tags) : null}, tags),
        deadline = COALESCE(${updateData.deadline ? updateData.deadline.toISOString() : null}, deadline),
        priority = COALESCE(${updateData.priority || null}, priority),
        image_url = COALESCE(${updateData.image_url || null}, image_url),
        completion_percentage = COALESCE(${updateData.completion_percentage !== undefined ? updateData.completion_percentage : null}, completion_percentage),
        updated_at = NOW()
    WHERE id = ${projectId} AND project_manager = ${managerId}
    RETURNING *
  `;

  if (result.length === 0) return null;

  const project = result[0] as any;
  if (project.tags) {
    project.tags = JSON.parse(project.tags);
  }
  return project as Project;
}

// Comment functions
export async function createComment(commentData: CreateCommentData & { id: string; author_id: string }): Promise<Comment> {
  const result = await sql`
    INSERT INTO comments (id, content, author_id, related_id, related_type)
    VALUES (
      ${commentData.id},
      ${commentData.content},
      ${commentData.author_id},
      ${commentData.related_id},
      ${commentData.related_type}
    )
    RETURNING *
  `;

  return result[0] as Comment;
}

export async function getCommentsByRelated(relatedId: string, relatedType: 'project' | 'task'): Promise<Comment[]> {
  const result = await sql`
    SELECT 
      c.*,
      u.name as author_name
    FROM comments c
    LEFT JOIN users u ON c.author_id = u.id
    WHERE c.related_id = ${relatedId} AND c.related_type = ${relatedType}
    ORDER BY c.created_at ASC
  `;

  return result as Comment[];
}

// File attachment functions
export async function createFileAttachment(fileData: CreateFileAttachmentData & { id: string; uploaded_by: string }): Promise<FileAttachment> {
  const result = await sql`
    INSERT INTO file_attachments (id, file_name, file_url, file_size, mime_type, task_id, uploaded_by)
    VALUES (
      ${fileData.id},
      ${fileData.file_name},
      ${fileData.file_url},
      ${fileData.file_size},
      ${fileData.mime_type},
      ${fileData.task_id},
      ${fileData.uploaded_by}
    )
    RETURNING *
  `;

  return result[0] as FileAttachment;
}

export async function getFileAttachmentsByTask(taskId: string): Promise<FileAttachment[]> {
  const result = await sql`
    SELECT 
      f.*,
      u.name as uploaded_by_name
    FROM file_attachments f
    LEFT JOIN users u ON f.uploaded_by = u.id
    WHERE f.task_id = ${taskId}
    ORDER BY f.created_at DESC
  `;

  return result as FileAttachment[];
}

// Chat message database operations
export async function createChatMessage(messageData: CreateChatMessageData & { id: string; sender_id: string }): Promise<ChatMessage> {
  const result = await sql`
    INSERT INTO chat_messages (id, content, sender_id)
    VALUES (
      ${messageData.id},
      ${messageData.content},
      ${messageData.sender_id}
    )
    RETURNING *
  `;

  return result[0] as ChatMessage;
}

export async function getChatMessages(limit = 100): Promise<ChatMessage[]> {
  const result = await sql`
    SELECT 
      c.*,
      u.name as sender_name,
      u.role as sender_role
    FROM chat_messages c
    LEFT JOIN users u ON c.sender_id = u.id
    ORDER BY c.created_at DESC
    LIMIT ${limit}
  `;

  return result.reverse() as ChatMessage[]; // Reverse to show oldest first
}

export async function getChatMessageById(messageId: string): Promise<ChatMessage | null> {
  const result = await sql`
    SELECT 
      c.*,
      u.name as sender_name,
      u.role as sender_role
    FROM chat_messages c
    LEFT JOIN users u ON c.sender_id = u.id
    WHERE c.id = ${messageId}
  `;

  return result[0] as ChatMessage || null;
}

// Chat file attachment functions
export async function createChatFileAttachment(fileData: CreateChatFileAttachmentData & { id: string; uploaded_by: string }): Promise<ChatFileAttachment> {
  const result = await sql`
    INSERT INTO chat_file_attachments (id, file_name, file_url, file_size, mime_type, message_id, uploaded_by)
    VALUES (
      ${fileData.id},
      ${fileData.file_name},
      ${fileData.file_url},
      ${fileData.file_size},
      ${fileData.mime_type},
      ${fileData.message_id},
      ${fileData.uploaded_by}
    )
    RETURNING *
  `;

  return result[0] as ChatFileAttachment;
}

export async function getChatFileAttachmentsByMessage(messageId: string): Promise<ChatFileAttachment[]> {
  const result = await sql`
    SELECT 
      f.*,
      u.name as uploaded_by_name
    FROM chat_file_attachments f
    LEFT JOIN users u ON f.uploaded_by = u.id
    WHERE f.message_id = ${messageId}
    ORDER BY f.created_at ASC
  `;

  return result as ChatFileAttachment[];
}

// Time log database operations
export async function createTimeLog(logData: CreateTimeLogData & { id: string }): Promise<TimeLog> {
  const result = await sql`
    INSERT INTO login_logs (id, user_id, ip_address, user_agent)
    VALUES (
      ${logData.id},
      ${logData.user_id},
      ${logData.ip_address || null},
      ${logData.user_agent || null}
    )
    RETURNING *
  `;

  return result[0] as TimeLog;
}

export async function getTimeLogsByUser(userId: string, limit = 50): Promise<TimeLog[]> {
  const result = await sql`
    SELECT 
      l.*,
      u.name as user_name,
      u.email as user_email
    FROM login_logs l
    LEFT JOIN users u ON l.user_id = u.id
    WHERE l.user_id = ${userId}
    ORDER BY l.login_timestamp DESC
    LIMIT ${limit}
  `;

  return result as TimeLog[];
}

export async function getAllTimeLogs(limit = 100): Promise<TimeLog[]> {
  const result = await sql`
    SELECT 
      l.*,
      u.name as user_name,
      u.email as user_email
    FROM login_logs l
    LEFT JOIN users u ON l.user_id = u.id
    ORDER BY l.login_timestamp DESC
    LIMIT ${limit}
  `;

  return result as TimeLog[];
}