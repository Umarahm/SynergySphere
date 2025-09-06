import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Users, Tag, AlertCircle, Clock, Edit, Save, X, MessageSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ProjectBreadcrumb } from "@/components/ProjectBreadcrumb";
import { useAuth } from "@/hooks/useAuth";
import { Project, Comment, UpdateProjectData } from "@shared/api";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default function ProjectDetail() {
    const [project, setProject] = useState<Project | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { token, user } = useAuth();

    // Edit form state
    const [editForm, setEditForm] = useState({
        name: "",
        description: "",
        tags: [] as string[],
        deadline: "",
        priority: "medium" as "low" | "medium" | "high",
        completion_percentage: 0
    });

    useEffect(() => {
        if (id) {
            fetchProject(id);
            fetchComments(id);
        }
    }, [id]);

    const fetchProject = async (projectId: string) => {
        try {
            const response = await fetch(`/api/projects/${projectId}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setProject(data.project);
                    // Initialize edit form with current project data
                    setEditForm({
                        name: data.project.name,
                        description: data.project.description,
                        tags: data.project.tags || [],
                        deadline: new Date(data.project.deadline).toISOString().split('T')[0],
                        priority: data.project.priority,
                        completion_percentage: data.project.completion_percentage || 0
                    });
                } else {
                    setError(data.message || "Failed to fetch project");
                }
            } else {
                setError("Failed to fetch project");
            }
        } catch (err) {
            setError("Error fetching project");
            console.error("Error fetching project:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchComments = async (projectId: string) => {
        try {
            const response = await fetch(`/api/projects/${projectId}/comments`, {
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

    const handleSaveProject = async () => {
        if (!project || !id) return;

        setIsSaving(true);
        try {
            const updateData: UpdateProjectData = {
                name: editForm.name,
                description: editForm.description,
                tags: editForm.tags,
                deadline: new Date(editForm.deadline),
                priority: editForm.priority,
                completion_percentage: editForm.completion_percentage
            };

            const response = await fetch(`/api/projects/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(updateData),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setProject(data.project);
                    setIsEditing(false);
                } else {
                    setError(data.message || "Failed to update project");
                }
            } else {
                setError("Failed to update project");
            }
        } catch (err) {
            setError("Error updating project");
            console.error("Error updating project:", err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelEdit = () => {
        if (project) {
            setEditForm({
                name: project.name,
                description: project.description,
                tags: project.tags || [],
                deadline: new Date(project.deadline).toISOString().split('T')[0],
                priority: project.priority,
                completion_percentage: project.completion_percentage || 0
            });
        }
        setIsEditing(false);
    };

    const handleAddComment = async () => {
        if (!newComment.trim() || !id) return;

        setIsSubmittingComment(true);
        try {
            const response = await fetch(`/api/projects/${id}/comments`, {
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

    const handleTagsChange = (tagsString: string) => {
        const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
        setEditForm(prev => ({ ...prev, tags }));
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "high":
                return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
            case "medium":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
            case "low":
                return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
        }
    };

    const formatDate = (date: Date | string) => {
        return new Date(date).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const canEdit = user?.role === 'project_manager' && project?.project_manager === user.id;

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

    if (error || !project) {
        return (
            <SidebarProvider>
                <div className="flex min-h-screen bg-background">
                    <Sidebar />
                    <SidebarInset className="flex-1">
                        <Header />
                        <main className="flex-1 p-8">
                            <ProjectBreadcrumb />

                            <div className="flex items-center gap-4 mb-8">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate("/projects")}
                                    className="bg-transparent border-border text-sidebar-foreground hover:bg-accent rounded-xl h-10 px-3"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back to Projects
                                </Button>
                            </div>

                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle className="w-8 h-8 text-destructive" />
                                </div>
                                <h3 className="text-sidebar-foreground font-aeonik text-lg font-medium mb-2">
                                    Project Not Found
                                </h3>
                                <p className="text-sidebar-foreground/70 font-aeonik text-sm mb-6">
                                    {error || "The project you're looking for doesn't exist or you don't have access to it."}
                                </p>
                                <Button
                                    onClick={() => navigate("/projects")}
                                    className="bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground rounded-xl h-10 px-4 font-aeonik"
                                >
                                    Back to Projects
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
                        <ProjectBreadcrumb />

                        <div className="flex items-center gap-4 mb-8">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate("/projects")}
                                className="bg-transparent border-border text-sidebar-foreground hover:bg-accent rounded-xl h-10 px-3"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Projects
                            </Button>
                            <div>
                                <h1 className="text-sidebar-foreground font-aeonik text-3xl font-medium mb-1">
                                    {project.name}
                                </h1>
                                <p className="text-sidebar-foreground/70 font-aeonik text-sm">
                                    Project Details
                                </p>
                            </div>
                        </div>

                        <div className="max-w-4xl space-y-6">
                            {/* Project Overview Card */}
                            <Card className="bg-card border-border">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            {isEditing ? (
                                                <div className="space-y-4">
                                                    <Input
                                                        value={editForm.name}
                                                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                                        className="text-2xl font-medium"
                                                        placeholder="Project name"
                                                    />
                                                    <Textarea
                                                        value={editForm.description}
                                                        onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                                        placeholder="Project description"
                                                        rows={3}
                                                    />
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium">Tags (comma-separated)</label>
                                                        <Input
                                                            value={editForm.tags.join(', ')}
                                                            onChange={(e) => handleTagsChange(e.target.value)}
                                                            placeholder="e.g. frontend, react, typescript"
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium">Deadline</label>
                                                            <Input
                                                                type="date"
                                                                value={editForm.deadline}
                                                                onChange={(e) => setEditForm(prev => ({ ...prev, deadline: e.target.value }))}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium">Completion: {editForm.completion_percentage}%</label>
                                                            <Slider
                                                                value={[editForm.completion_percentage]}
                                                                onValueChange={(value) => setEditForm(prev => ({ ...prev, completion_percentage: value[0] }))}
                                                                max={100}
                                                                step={5}
                                                                className="w-full"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div>
                                                    <CardTitle className="text-sidebar-foreground font-aeonik text-2xl font-medium mb-2">
                                                        {project.name}
                                                    </CardTitle>
                                                    <CardDescription className="text-sidebar-foreground/70 font-aeonik text-base">
                                                        {project.description}
                                                    </CardDescription>
                                                    {(project.completion_percentage || 0) > 0 && (
                                                        <div className="mt-4">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="text-sm font-medium">Progress</span>
                                                                <span className="text-sm">{project.completion_percentage || 0}%</span>
                                                            </div>
                                                            <div className="w-full bg-secondary rounded-full h-2">
                                                                <div
                                                                    className="bg-primary h-2 rounded-full transition-all duration-300"
                                                                    style={{ width: `${project.completion_percentage || 0}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {isEditing ? (
                                                <Select value={editForm.priority} onValueChange={(value: "low" | "medium" | "high") => setEditForm(prev => ({ ...prev, priority: value }))}>
                                                    <SelectTrigger className="w-32">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="low">Low</SelectItem>
                                                        <SelectItem value="medium">Medium</SelectItem>
                                                        <SelectItem value="high">High</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <Badge className={`${getPriorityColor(project.priority)} border-0 text-sm px-3 py-1`}>
                                                    {project.priority} priority
                                                </Badge>
                                            )}
                                            {canEdit && (
                                                <div className="flex gap-2">
                                                    {isEditing ? (
                                                        <>
                                                            <Button
                                                                onClick={handleSaveProject}
                                                                disabled={isSaving}
                                                                size="sm"
                                                                className="bg-green-600 hover:bg-green-700"
                                                            >
                                                                <Save className="w-4 h-4 mr-1" />
                                                                {isSaving ? 'Saving...' : 'Save'}
                                                            </Button>
                                                            <Button
                                                                onClick={handleCancelEdit}
                                                                variant="outline"
                                                                size="sm"
                                                            >
                                                                <X className="w-4 h-4 mr-1" />
                                                                Cancel
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <Button
                                                            onClick={() => setIsEditing(true)}
                                                            variant="outline"
                                                            size="sm"
                                                        >
                                                            <Edit className="w-4 h-4 mr-1" />
                                                            Edit Project
                                                        </Button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                            </Card>

                            {/* Project Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Project Information */}
                                <Card className="bg-card border-border">
                                    <CardHeader>
                                        <CardTitle className="text-sidebar-foreground font-aeonik text-lg font-medium flex items-center gap-2">
                                            <Calendar className="w-5 h-5" />
                                            Project Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sidebar-foreground/70 font-aeonik text-sm">Deadline:</span>
                                            <span className="text-sidebar-foreground font-aeonik text-sm font-medium">
                                                {formatDate(project.deadline)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sidebar-foreground/70 font-aeonik text-sm">Created:</span>
                                            <span className="text-sidebar-foreground font-aeonik text-sm font-medium">
                                                {formatDate(project.created_at)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sidebar-foreground/70 font-aeonik text-sm">Last Updated:</span>
                                            <span className="text-sidebar-foreground font-aeonik text-sm font-medium">
                                                {formatDate(project.updated_at)}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Team Information */}
                                <Card className="bg-card border-border">
                                    <CardHeader>
                                        <CardTitle className="text-sidebar-foreground font-aeonik text-lg font-medium flex items-center gap-2">
                                            <Users className="w-5 h-5" />
                                            Team Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sidebar-foreground/70 font-aeonik text-sm">Project Manager:</span>
                                            <span className="text-sidebar-foreground font-aeonik text-sm font-medium">
                                                {project.project_manager_name || "Unknown"}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sidebar-foreground/70 font-aeonik text-sm">Status:</span>
                                            <Badge variant="outline" className="bg-sidebar-accent/10 text-sidebar-accent border-sidebar-accent/20">
                                                Active
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sidebar-foreground/70 font-aeonik text-sm">Completion:</span>
                                            <span className="text-sidebar-foreground font-aeonik text-sm font-medium">
                                                {project.completion_percentage || 0}%
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Tags Section */}
                            {project.tags && project.tags.length > 0 && (
                                <Card className="bg-card border-border">
                                    <CardHeader>
                                        <CardTitle className="text-sidebar-foreground font-aeonik text-lg font-medium flex items-center gap-2">
                                            <Tag className="w-5 h-5" />
                                            Project Tags
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-wrap gap-2">
                                            {project.tags.map((tag, index) => (
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

                            {/* Project Image */}
                            {project.image_url && (
                                <Card className="bg-card border-border">
                                    <CardHeader>
                                        <CardTitle className="text-sidebar-foreground font-aeonik text-lg font-medium">
                                            Project Image
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <img
                                            src={project.image_url}
                                            alt={project.name}
                                            className="w-full h-64 object-cover rounded-xl border border-border"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                            }}
                                        />
                                    </CardContent>
                                </Card>
                            )}

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