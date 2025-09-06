import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, User, Tag, AlertCircle, Clock, MessageSquare, Plus, Upload, File, Download, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TaskBreadcrumb } from "@/components/TaskBreadcrumb";
import { useAuth } from "@/hooks/useAuth";
import { Task, Comment, FileAttachment, TaskStatus } from "@shared/api";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default function TaskDetail() {
    const [task, setTask] = useState<Task | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [files, setFiles] = useState<FileAttachment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [newComment, setNewComment] = useState("");
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [isUploadingFile, setIsUploadingFile] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { token, user } = useAuth();

    useEffect(() => {
        if (id) {
            fetchTask(id);
            fetchComments(id);
            fetchFiles(id);
        }
    }, [id]);

    const fetchTask = async (taskId: string) => {
        try {
            const response = await fetch(`/api/tasks/${taskId}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setTask(data.task);
                } else {
                    setError(data.message || "Failed to fetch task");
                }
            } else {
                setError("Failed to fetch task");
            }
        } catch (err) {
            setError("Error fetching task");
            console.error("Error fetching task:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchComments = async (taskId: string) => {
        try {
            const response = await fetch(`/api/tasks/${taskId}/comments`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setComments(data.comments || []);
                }
            }
        } catch (err) {
            console.error("Error fetching comments:", err);
        }
    };

    const fetchFiles = async (taskId: string) => {
        try {
            const response = await fetch(`/api/tasks/${taskId}/files`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setFiles(data.files || []);
                }
            }
        } catch (err) {
            console.error("Error fetching files:", err);
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim() || !id) return;

        setIsSubmittingComment(true);
        try {
            const response = await fetch(`/api/tasks/${id}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ content: newComment.trim() }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setComments(prev => [...prev, data.comment]);
                    setNewComment("");
                } else {
                    setError(data.message || "Failed to add comment");
                }
            } else {
                setError("Failed to add comment");
            }
        } catch (err) {
            setError("Error adding comment");
            console.error("Error adding comment:", err);
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !id) return;

        setIsUploadingFile(true);
        setError(""); // Clear any previous errors

        try {
            // Validate file size (max 10MB)
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (file.size > maxSize) {
                setError("File size must be less than 10MB");
                return;
            }

            // Create a more realistic file URL using the current domain
            const timestamp = Date.now();
            const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const mockFileUrl = `${window.location.origin}/uploads/${timestamp}_${cleanFileName}`;

            const response = await fetch(`/api/tasks/${id}/files`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    file_name: file.name,
                    file_url: mockFileUrl,
                    file_size: file.size,
                    mime_type: file.type || 'application/octet-stream'
                }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.file) {
                    setFiles(prev => [...prev, data.file]);
                    // Show success message
                    console.log('File uploaded successfully:', data.file.file_name);
                } else {
                    setError(data.message || "Failed to upload file");
                }
            } else {
                const errorData = await response.json().catch(() => ({}));
                setError(errorData.message || `Failed to upload file (${response.status})`);
            }
        } catch (err) {
            setError("Error uploading file. Please try again.");
            console.error("Error uploading file:", err);
        } finally {
            setIsUploadingFile(false);
            // Reset the input
            event.target.value = '';
        }
    };

    const handleStatusUpdate = async (newStatus: TaskStatus) => {
        if (!task || !id) return;

        setIsUpdatingStatus(true);
        try {
            const response = await fetch(`/api/tasks/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setTask(data.task);
                } else {
                    setError(data.message || "Failed to update task status");
                }
            } else {
                setError("Failed to update task status");
            }
        } catch (err) {
            setError("Error updating task status");
            console.error("Error updating task status:", err);
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const getStatusColor = (status: TaskStatus) => {
        switch (status) {
            case "new_task":
                return "bg-blue-500/10 text-blue-600 border-blue-500/20";
            case "in_progress":
                return "bg-orange-500/10 text-orange-600 border-orange-500/20";
            case "completed":
                return "bg-green-500/10 text-green-600 border-green-500/20";
            case "approved":
                return "bg-purple-500/10 text-purple-600 border-purple-500/20";
            default:
                return "bg-gray-500/10 text-gray-600 border-gray-500/20";
        }
    };

    const getStatusLabel = (status: TaskStatus) => {
        switch (status) {
            case "new_task":
                return "New Task";
            case "in_progress":
                return "In Progress";
            case "completed":
                return "Completed";
            case "approved":
                return "Approved";
            default:
                return status;
        }
    };

    const getAvailableStatuses = (currentStatus: TaskStatus): TaskStatus[] => {
        const isEmployee = user?.role === 'employee';
        const isTaskOwner = task?.assignee === user?.id;

        if (isEmployee && isTaskOwner) {
            switch (currentStatus) {
                case "new_task":
                    return ["in_progress"];
                case "in_progress":
                    return ["completed"];
                case "completed":
                    return [];
                case "approved":
                    return [];
                default:
                    return [];
            }
        }
        return [];
    };

    const formatDate = (date: Date | string) => {
        return new Date(date).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const isOverdue = (deadline: string) => {
        return new Date(deadline) < new Date();
    };

    if (isLoading) {
        return (
            <SidebarProvider>
                <div className="flex min-h-screen bg-background">
                    <Sidebar />
                    <SidebarInset className="flex-1">
                        <Header />
                        <main className="flex-1 p-8">
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        </main>
                    </SidebarInset>
                </div>
            </SidebarProvider>
        );
    }

    if (error || !task) {
        return (
            <SidebarProvider>
                <div className="flex min-h-screen bg-background">
                    <Sidebar />
                    <SidebarInset className="flex-1">
                        <Header />
                        <main className="flex-1 p-8">
                            <TaskBreadcrumb />

                            <div className="flex items-center gap-4 mb-8">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate("/tasks")}
                                    className="bg-transparent border-border text-sidebar-foreground hover:bg-accent rounded-xl h-10 px-3"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back to Tasks
                                </Button>
                            </div>

                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle className="w-8 h-8 text-destructive" />
                                </div>
                                <h3 className="text-sidebar-foreground font-aeonik text-lg font-medium mb-2">
                                    Task Not Found
                                </h3>
                                <p className="text-sidebar-foreground/70 font-aeonik text-sm mb-6">
                                    {error || "The task you're looking for doesn't exist or you don't have access to it."}
                                </p>
                                <Button
                                    onClick={() => navigate("/tasks")}
                                    className="bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground rounded-xl h-10 px-4 font-aeonik"
                                >
                                    Back to Tasks
                                </Button>
                            </div>
                        </main>
                    </SidebarInset>
                </div>
            </SidebarProvider>
        );
    }

    return (
        <SidebarProvider>
            <div className="flex min-h-screen bg-background">
                <Sidebar />
                <SidebarInset className="flex-1">
                    <Header />
                    <main className="flex-1 p-8">
                        <TaskBreadcrumb />

                        <div className="flex items-center gap-4 mb-8">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate("/tasks")}
                                className="bg-transparent border-border text-sidebar-foreground hover:bg-accent rounded-xl h-10 px-3"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Tasks
                            </Button>
                            <div>
                                <h1 className="text-sidebar-foreground font-aeonik text-3xl font-medium mb-1">
                                    {task.name}
                                </h1>
                                <p className="text-sidebar-foreground/70 font-aeonik text-sm">
                                    Task Details
                                </p>
                            </div>
                        </div>

                        <div className="max-w-4xl space-y-6">
                            {/* Error Message */}
                            {error && (
                                <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4">
                                    <p className="text-destructive font-aeonik text-sm">{error}</p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setError("")}
                                        className="mt-2"
                                    >
                                        Dismiss
                                    </Button>
                                </div>
                            )}

                            {/* Task Overview Card */}
                            <Card className="bg-card border-border">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="text-sidebar-foreground font-aeonik text-2xl font-medium mb-2">
                                                {task.name}
                                            </CardTitle>
                                            <CardDescription className="text-sidebar-foreground/70 font-aeonik text-base">
                                                {task.description}
                                            </CardDescription>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge className={`${getStatusColor(task.status)} border rounded-xl font-aeonik text-xs px-3 py-1`}>
                                                {getStatusLabel(task.status)}
                                            </Badge>
                                            {isOverdue(task.deadline) && task.status !== "completed" && task.status !== "approved" && (
                                                <Badge className="bg-red-500/10 text-red-600 border-red-500/20 border rounded-xl font-aeonik text-xs px-3 py-1">
                                                    Overdue
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                            </Card>

                            {/* Task Actions */}
                            {user?.role === 'employee' && task.assignee === user.id && (
                                <Card className="bg-card border-border">
                                    <CardHeader>
                                        <CardTitle className="text-sidebar-foreground font-aeonik text-lg font-medium">
                                            Task Actions
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm font-medium">Update Status:</span>
                                            {getAvailableStatuses(task.status).map((status) => (
                                                <Button
                                                    key={status}
                                                    onClick={() => handleStatusUpdate(status)}
                                                    disabled={isUpdatingStatus}
                                                    size="sm"
                                                    className="bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground"
                                                >
                                                    <CheckCircle className="w-4 h-4 mr-1" />
                                                    Mark as {getStatusLabel(status)}
                                                </Button>
                                            ))}
                                            {getAvailableStatuses(task.status).length === 0 && (
                                                <span className="text-sidebar-foreground/60 text-sm">No actions available</span>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Task Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Task Information */}
                                <Card className="bg-card border-border">
                                    <CardHeader>
                                        <CardTitle className="text-sidebar-foreground font-aeonik text-lg font-medium flex items-center gap-2">
                                            <Calendar className="w-5 h-5" />
                                            Task Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sidebar-foreground/70 font-aeonik text-sm">Deadline:</span>
                                            <span className="text-sidebar-foreground font-aeonik text-sm font-medium">
                                                {formatDate(task.deadline)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sidebar-foreground/70 font-aeonik text-sm">Created:</span>
                                            <span className="text-sidebar-foreground font-aeonik text-sm font-medium">
                                                {formatDate(task.created_at)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sidebar-foreground/70 font-aeonik text-sm">Project:</span>
                                            <span className="text-sidebar-foreground font-aeonik text-sm font-medium">
                                                {task.project_name || "No Project"}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Assignment Information */}
                                <Card className="bg-card border-border">
                                    <CardHeader>
                                        <CardTitle className="text-sidebar-foreground font-aeonik text-lg font-medium flex items-center gap-2">
                                            <User className="w-5 h-5" />
                                            Assignment Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sidebar-foreground/70 font-aeonik text-sm">Assigned to:</span>
                                            <span className="text-sidebar-foreground font-aeonik text-sm font-medium">
                                                {task.assignee_name || "Unknown"}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sidebar-foreground/70 font-aeonik text-sm">Created by:</span>
                                            <span className="text-sidebar-foreground font-aeonik text-sm font-medium">
                                                {task.created_by_name || "Unknown"}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sidebar-foreground/70 font-aeonik text-sm">Status:</span>
                                            <Badge className={`${getStatusColor(task.status)} border-0 text-xs px-2 py-1`}>
                                                {getStatusLabel(task.status)}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Tags Section */}
                            {task.tags && task.tags.length > 0 && (
                                <Card className="bg-card border-border">
                                    <CardHeader>
                                        <CardTitle className="text-sidebar-foreground font-aeonik text-lg font-medium flex items-center gap-2">
                                            <Tag className="w-5 h-5" />
                                            Tags
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-wrap gap-2">
                                            {task.tags.map((tag, index) => (
                                                <Badge
                                                    key={index}
                                                    variant="outline"
                                                    className="bg-sidebar-accent/10 text-sidebar-accent border-sidebar-accent/20 font-aeonik"
                                                >
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* File Attachments Section */}
                            <Card className="bg-card border-border">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-sidebar-foreground font-aeonik text-lg font-medium flex items-center gap-2">
                                            <File className="w-5 h-5" />
                                            File Attachments ({files.length})
                                        </CardTitle>
                                        {user?.role === 'employee' && task.assignee === user.id && (
                                            <div>
                                                <Input
                                                    type="file"
                                                    onChange={handleFileUpload}
                                                    disabled={isUploadingFile}
                                                    className="hidden"
                                                    id="file-upload"
                                                />
                                                <Button
                                                    onClick={() => document.getElementById('file-upload')?.click()}
                                                    disabled={isUploadingFile}
                                                    size="sm"
                                                    className="bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground"
                                                >
                                                    <Upload className="w-4 h-4 mr-1" />
                                                    {isUploadingFile ? 'Uploading...' : 'Upload File'}
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {files.length === 0 ? (
                                        <p className="text-sidebar-foreground/70 font-aeonik text-sm text-center py-4">
                                            No files attached yet.
                                        </p>
                                    ) : (
                                        <div className="space-y-3">
                                            {files.map((file) => (
                                                <div key={file.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <File className="w-5 h-5 text-sidebar-foreground/60" />
                                                        <div>
                                                            <p className="font-medium text-sm">{file.file_name}</p>
                                                            <p className="text-xs text-sidebar-foreground/60">
                                                                {formatFileSize(file.file_size)} • Uploaded by {file.uploaded_by_name || 'Unknown'} • {new Date(file.created_at).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        onClick={() => window.open(file.file_url, '_blank')}
                                                        size="sm"
                                                        variant="outline"
                                                    >
                                                        <Download className="w-4 h-4 mr-1" />
                                                        Download
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Comments Section */}
                            <Card className="bg-card border-border">
                                <CardHeader>
                                    <CardTitle className="text-sidebar-foreground font-aeonik text-lg font-medium flex items-center gap-2">
                                        <MessageSquare className="w-5 h-5" />
                                        Comments ({comments.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Add Comment Form */}
                                    <div className="space-y-2">
                                        <Textarea
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            placeholder="Add a comment..."
                                            rows={3}
                                            className="resize-none"
                                        />
                                        <div className="flex justify-end">
                                            <Button
                                                onClick={handleAddComment}
                                                disabled={!newComment.trim() || isSubmittingComment}
                                                size="sm"
                                                className="bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground"
                                            >
                                                <Plus className="w-4 h-4 mr-1" />
                                                {isSubmittingComment ? 'Adding...' : 'Add Comment'}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Comments List */}
                                    <div className="space-y-4 border-t pt-4">
                                        {comments.length === 0 ? (
                                            <p className="text-sidebar-foreground/70 font-aeonik text-sm text-center py-4">
                                                No comments yet. Be the first to add one!
                                            </p>
                                        ) : (
                                            comments.map((comment) => (
                                                <div key={comment.id} className="bg-secondary/50 rounded-lg p-4">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-medium text-sm">
                                                            {comment.author_name || 'Unknown User'}
                                                        </span>
                                                        <span className="text-xs text-sidebar-foreground/60">
                                                            {new Date(comment.created_at).toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </span>
                                                    </div>
                                                    <p className="text-sidebar-foreground/80 text-sm whitespace-pre-wrap">
                                                        {comment.content}
                                                    </p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
}