/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * User types for authentication
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role?: UserRole;
  phone?: string;
  department?: string;
  bio?: string;
  avatar_url?: string;
  created_at: Date;
}

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

export interface LoginData {
  email: string;
  password: string;
}

/**
 * Authentication API responses
 */
export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}

export interface VerifyResponse {
  success: boolean;
  user?: User;
}

/**
 * User profile update types
 */
export interface UpdateUserProfileData {
  name?: string;
  email?: string;
  phone?: string;
  department?: string;
  bio?: string;
  avatar_url?: string;
}

export interface UserProfileResponse {
  success: boolean;
  message: string;
  user?: User;
}

export interface AllUsersResponse {
  success: boolean;
  message: string;
  users?: User[];
}

/**
 * User roles
 */
export type UserRole = 'employee' | 'project_manager';

/**
 * Project types
 */
export interface Project {
  id: string;
  name: string;
  description: string;
  tags: string[];
  project_manager: string; // User ID
  project_manager_name?: string; // Populated field
  deadline: Date;
  priority: 'low' | 'medium' | 'high';
  image_url?: string;
  completion_percentage: number; // 0-100
  created_at: Date;
  updated_at: Date;
}

export interface CreateProjectData {
  name: string;
  description: string;
  tags: string[];
  project_manager: string;
  deadline: Date;
  priority: 'low' | 'medium' | 'high';
  image_url?: string;
  completion_percentage?: number;
}

export interface ProjectResponse {
  success: boolean;
  message: string;
  project?: Project;
}

export interface ProjectsResponse {
  success: boolean;
  message: string;
  projects?: Project[];
}

/**
 * Task types
 */
export type TaskStatus = 'new_task' | 'in_progress' | 'completed' | 'approved';

export interface Task {
  id: string;
  name: string;
  description: string;
  assignee: string; // User ID
  assignee_name?: string; // Populated field
  project_id?: string; // Optional - can be set when creating from project view
  project_name?: string; // Populated field
  tags: string[];
  deadline: Date;
  image_url?: string;
  status: TaskStatus;
  created_by: string; // User ID (project manager)
  created_by_name?: string; // Populated field
  created_at: Date;
  updated_at: Date;
}

export interface CreateTaskData {
  name: string;
  description: string;
  assignee: string;
  project_id?: string;
  tags: string[];
  deadline: Date;
  image_url?: string;
}

export interface TaskResponse {
  success: boolean;
  message: string;
  task?: Task;
}

export interface TasksResponse {
  success: boolean;
  message: string;
  tasks?: Task[];
}

export interface UpdateTaskStatusData {
  status: TaskStatus;
}

/**
 * Notification types
 */
export type NotificationType = 'task_assigned' | 'task_completed' | 'task_approved' | 'project_created' | 'deadline_reminder';

export interface Notification {
  id: string;
  user_id: string; // User ID who receives the notification
  type: NotificationType;
  title: string;
  message: string;
  related_id?: string; // Task ID or Project ID
  related_type?: 'task' | 'project';
  is_read: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateNotificationData {
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  related_id?: string;
  related_type?: 'task' | 'project';
}

export interface NotificationResponse {
  success: boolean;
  message: string;
  notification?: Notification;
}

export interface NotificationsResponse {
  success: boolean;
  message: string;
  notifications?: Notification[];
  unread_count?: number;
}

export interface MarkNotificationReadData {
  notification_id: string;
}

/**
 * Comment types for projects and tasks
 */
export interface Comment {
  id: string;
  content: string;
  author_id: string;
  author_name?: string;
  related_id: string; // Project ID or Task ID
  related_type: 'project' | 'task';
  created_at: Date;
  updated_at: Date;
}

export interface CreateCommentData {
  content: string;
  related_id: string;
  related_type: 'project' | 'task';
}

export interface CommentResponse {
  success: boolean;
  message: string;
  comment?: Comment;
}

export interface CommentsResponse {
  success: boolean;
  message: string;
  comments?: Comment[];
}

/**
 * Project update types
 */
export interface UpdateProjectData {
  name?: string;
  description?: string;
  tags?: string[];
  deadline?: Date;
  priority?: 'low' | 'medium' | 'high';
  image_url?: string;
  completion_percentage?: number;
}

/**
 * File attachment types
 */
export interface FileAttachment {
  id: string;
  file_name: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  task_id: string;
  uploaded_by: string;
  uploaded_by_name?: string;
  created_at: Date;
}

export interface CreateFileAttachmentData {
  file_name: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  task_id: string;
}

export interface FileAttachmentResponse {
  success: boolean;
  message: string;
  file?: FileAttachment;
}

export interface FileAttachmentsResponse {
  success: boolean;
  message: string;
  files?: FileAttachment[];
}

/**
 * Dashboard types
 */
export interface DashboardData {
  success: boolean;
  message: string;
  data?: {
    user_role: UserRole;
    tasks: {
      total: number;
      completed: number;
      in_progress: number;
      new_tasks: number;
      today_tasks: Task[];
      recent_tasks: Task[];
    };
    projects: {
      total: number;
      workload: ProjectWorkload[];
    };
  };
}

export interface ProjectWorkload {
  project_id: string;
  project_name: string;
  total_tasks: number;
  completed_tasks: number;
  progress_percentage: number;
  deadline: Date;
  priority: 'low' | 'medium' | 'high';
}

/**
 * Chat types for global chatroom
 */
export interface ChatMessage {
  id: string;
  content: string;
  sender_id: string;
  sender_name?: string;
  sender_role?: UserRole;
  created_at: Date;
  updated_at: Date;
}

export interface CreateChatMessageData {
  content: string;
}

export interface ChatMessageResponse {
  success: boolean;
  message: string;
  chat_message?: ChatMessage;
}

export interface ChatMessagesResponse {
  success: boolean;
  message: string;
  messages?: ChatMessage[];
}

export interface ChatFileAttachment {
  id: string;
  file_name: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  message_id: string;
  uploaded_by: string;
  uploaded_by_name?: string;
  created_at: Date;
}

export interface CreateChatFileAttachmentData {
  file_name: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  message_id: string;
}

export interface ChatFileAttachmentResponse {
  success: boolean;
  message: string;
  file?: ChatFileAttachment;
}

export interface ChatFileAttachmentsResponse {
  success: boolean;
  message: string;
  files?: ChatFileAttachment[];
}

/**
 * Time log types for tracking user login history
 */
export interface TimeLog {
  id: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  login_timestamp: Date;
  ip_address?: string;
  user_agent?: string;
}

export interface TimeLogResponse {
  success: boolean;
  message: string;
  logs?: TimeLog[];
}

export interface CreateTimeLogData {
  user_id: string;
  ip_address?: string;
  user_agent?: string;
}
