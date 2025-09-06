import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Calendar, User, Tag, Image, AlertCircle, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TaskBreadcrumb } from "@/components/TaskBreadcrumb";
import { useAuth } from "@/hooks/useAuth";
import { User as UserType, CreateTaskData, Project } from "@shared/api";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import ErrorBoundary from "../components/ErrorBoundary";

export default function NewTask() {
    // Debug logging
    console.log('NewTask component rendering...');

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [newTag, setNewTag] = useState("");
    const [assignee, setAssignee] = useState("");
    const [projectId, setProjectId] = useState("");
    const [deadline, setDeadline] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [employees, setEmployees] = useState<UserType[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);
    const [isLoadingProjects, setIsLoadingProjects] = useState(true);

    const navigate = useNavigate();
    const { user, token, isLoading: authLoading } = useAuth();
    const [searchParams] = useSearchParams();

    // Debug auth state
    console.log('Auth state:', { user, token, authLoading });

    // Get project ID from URL params if creating task from project view
    const preselectedProjectId = searchParams.get("project");

    // Check if user is project manager
    if (!authLoading && user && user.role !== 'project_manager') {
        console.log('User is not a project manager, redirecting...');
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-sidebar-foreground font-aeonik text-xl font-medium mb-2">
                        Access Denied
                    </h2>
                    <p className="text-sidebar-foreground/70 font-aeonik text-sm mb-4">
                        Only project managers can create tasks.
                    </p>
                    <Button onClick={() => navigate('/tasks')} className="bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground rounded-xl">
                        Go to Tasks
                    </Button>
                </div>
            </div>
        );
    }

    // Show loading while auth is loading
    if (authLoading) {
        console.log('Auth is loading...');
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center animate-pulse">
                        <div className="w-4 h-4 bg-primary-foreground rounded-full"></div>
                    </div>
                    <span className="text-foreground font-aeonik text-lg font-medium">
                        Loading...
                    </span>
                </div>
            </div>
        );
    }

    useEffect(() => {
        fetchEmployees();
        fetchProjects();

        // Pre-select project if specified in URL
        if (preselectedProjectId) {
            setProjectId(preselectedProjectId);
        }
    }, [preselectedProjectId]);

    const fetchEmployees = async () => {
        try {
            const response = await fetch("/api/users?role=employee", {
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setEmployees(data.users || []);
                } else {
                    console.error("Failed to fetch employees:", data.message);
                }
            } else {
                console.error("Failed to fetch employees");
            }
        } catch (error) {
            console.error("Error fetching employees:", error);
        } finally {
            setIsLoadingEmployees(false);
        }
    };

    const fetchProjects = async () => {
        try {
            const response = await fetch("/api/projects", {
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    // Filter to only show projects managed by current user
                    const userProjects = data.projects?.filter((p: Project) =>
                        p.project_manager === user?.id
                    ) || [];
                    setProjects(userProjects);
                } else {
                    console.error("Failed to fetch projects:", data.message);
                }
            } else {
                console.error("Failed to fetch projects");
            }
        } catch (error) {
            console.error("Error fetching projects:", error);
        } finally {
            setIsLoadingProjects(false);
        }
    };

    const addTag = () => {
        if (newTag.trim() && !tags.includes(newTag.trim())) {
            setTags([...tags, newTag.trim()]);
            setNewTag("");
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addTag();
        }
    };

    const formatDateForInput = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const validateForm = () => {
        if (!name.trim()) {
            setError("Task name is required");
            return false;
        }
        if (!description.trim()) {
            setError("Description is required");
            return false;
        }
        if (!assignee) {
            setError("Please select an assignee");
            return false;
        }
        if (!deadline) {
            setError("Deadline is required");
            return false;
        }

        const deadlineDate = new Date(deadline);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (deadlineDate < today) {
            setError("Deadline cannot be in the past");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const taskData: CreateTaskData = {
                name: name.trim(),
                description: description.trim(),
                assignee,
                project_id: projectId === "no-project" ? undefined : projectId || undefined,
                tags,
                deadline: new Date(deadline),
                image_url: imageUrl.trim() || undefined,
            };

            const response = await fetch("/api/tasks", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(taskData),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Navigate back to tasks list
                navigate("/tasks");
            } else {
                setError(data.message || "Failed to create task");
            }
        } catch (error) {
            console.error("Error creating task:", error);
            setError("An error occurred while creating the task");
        } finally {
            setIsLoading(false);
        }
    };

    // Set default deadline to tomorrow
    useEffect(() => {
        if (!deadline) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            setDeadline(formatDateForInput(tomorrow));
        }
    }, [deadline]);

    console.log('About to render main component...', { user, authLoading });

    return (
        <ErrorBoundary>
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
                                        Create New Task
                                    </h1>
                                    <p className="text-sidebar-foreground/70 font-aeonik text-sm">
                                        Assign a new task to an employee with all the necessary details
                                    </p>
                                </div>
                            </div>

                            <div className="max-w-2xl">
                                <Card className="bg-card border-border">
                                    <CardHeader>
                                        <CardTitle className="text-sidebar-foreground font-aeonik text-xl font-medium">
                                            Task Details
                                        </CardTitle>
                                        <CardDescription className="text-sidebar-foreground/70 font-aeonik text-sm">
                                            Provide comprehensive information about the task
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent>
                                        <form onSubmit={handleSubmit} className="space-y-6">
                                            {error && (
                                                <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4">
                                                    <div className="flex items-center gap-2">
                                                        <AlertCircle className="w-5 h-5 text-destructive" />
                                                        <p className="text-destructive font-aeonik text-sm">{error}</p>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="space-y-2">
                                                <Label htmlFor="name" className="text-sidebar-foreground font-aeonik text-sm font-medium">
                                                    Task Name *
                                                </Label>
                                                <Input
                                                    id="name"
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    placeholder="Enter task name"
                                                    className="bg-card border-border text-sidebar-foreground rounded-xl h-12 font-aeonik"
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="assignee" className="text-sidebar-foreground font-aeonik text-sm font-medium">
                                                    Assignee *
                                                </Label>
                                                <Select value={assignee} onValueChange={setAssignee} required>
                                                    <SelectTrigger className="bg-card border-border text-sidebar-foreground rounded-xl h-12">
                                                        <div className="flex items-center gap-2">
                                                            <User className="w-4 h-4 text-sidebar-foreground/70" />
                                                            <SelectValue placeholder="Select an employee" />
                                                        </div>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {isLoadingEmployees ? (
                                                            <SelectItem value="loading" disabled>Loading employees...</SelectItem>
                                                        ) : employees.length === 0 ? (
                                                            <SelectItem value="no-employees" disabled>No employees found</SelectItem>
                                                        ) : (
                                                            employees.map((employee) => (
                                                                <SelectItem key={employee.id} value={employee.id}>
                                                                    {employee.name} ({employee.email})
                                                                </SelectItem>
                                                            ))
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="project" className="text-sidebar-foreground font-aeonik text-sm font-medium">
                                                    Project (Optional)
                                                </Label>
                                                <Select value={projectId} onValueChange={setProjectId}>
                                                    <SelectTrigger className="bg-card border-border text-sidebar-foreground rounded-xl h-12">
                                                        <div className="flex items-center gap-2">
                                                            <Briefcase className="w-4 h-4 text-sidebar-foreground/70" />
                                                            <SelectValue placeholder="Select a project (optional)" />
                                                        </div>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="no-project">No project</SelectItem>
                                                        {isLoadingProjects ? (
                                                            <SelectItem value="loading-projects" disabled>Loading projects...</SelectItem>
                                                        ) : projects.length === 0 ? (
                                                            <SelectItem value="no-projects" disabled>No projects found</SelectItem>
                                                        ) : (
                                                            projects.map((project) => (
                                                                <SelectItem key={project.id} value={project.id}>
                                                                    {project.name}
                                                                </SelectItem>
                                                            ))
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="tags" className="text-sidebar-foreground font-aeonik text-sm font-medium">
                                                    Tags
                                                </Label>
                                                <div className="space-y-3">
                                                    <div className="flex gap-2">
                                                        <Input
                                                            id="tags"
                                                            type="text"
                                                            value={newTag}
                                                            onChange={(e) => setNewTag(e.target.value)}
                                                            onKeyPress={handleKeyPress}
                                                            placeholder="Add a tag"
                                                            className="bg-card border-border text-sidebar-foreground rounded-xl h-12 font-aeonik"
                                                        />
                                                        <Button
                                                            type="button"
                                                            onClick={addTag}
                                                            variant="outline"
                                                            className="bg-transparent border-border text-sidebar-foreground hover:bg-accent rounded-xl h-12 px-4"
                                                        >
                                                            <Tag className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                    {tags.length > 0 && (
                                                        <div className="flex flex-wrap gap-2">
                                                            {tags.map((tag, index) => (
                                                                <Badge
                                                                    key={index}
                                                                    variant="secondary"
                                                                    className="bg-sidebar-accent/20 text-sidebar-accent border-sidebar-accent/30 rounded-lg font-aeonik text-xs px-3 py-1 cursor-pointer hover:bg-sidebar-accent/30"
                                                                    onClick={() => removeTag(tag)}
                                                                >
                                                                    {tag} ×
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="deadline" className="text-sidebar-foreground font-aeonik text-sm font-medium">
                                                    Deadline *
                                                </Label>
                                                <div className="relative">
                                                    <Input
                                                        id="deadline"
                                                        type="date"
                                                        value={deadline}
                                                        onChange={(e) => setDeadline(e.target.value)}
                                                        className="bg-card border-border text-sidebar-foreground rounded-xl h-12 font-aeonik pl-12"
                                                        required
                                                    />
                                                    <Calendar className="w-4 h-4 text-sidebar-foreground/70 absolute left-4 top-1/2 transform -translate-y-1/2" />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="image" className="text-sidebar-foreground font-aeonik text-sm font-medium">
                                                    Image URL (Optional)
                                                </Label>
                                                <div className="relative">
                                                    <Input
                                                        id="image"
                                                        type="url"
                                                        value={imageUrl}
                                                        onChange={(e) => setImageUrl(e.target.value)}
                                                        placeholder="https://example.com/image.jpg"
                                                        className="bg-card border-border text-sidebar-foreground rounded-xl h-12 font-aeonik pl-12"
                                                    />
                                                    <Image className="w-4 h-4 text-sidebar-foreground/70 absolute left-4 top-1/2 transform -translate-y-1/2" />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="description" className="text-sidebar-foreground font-aeonik text-sm font-medium">
                                                    Description *
                                                </Label>
                                                <Textarea
                                                    id="description"
                                                    value={description}
                                                    onChange={(e) => setDescription(e.target.value)}
                                                    placeholder="Provide a detailed description of the task..."
                                                    className="bg-card border-border text-sidebar-foreground rounded-xl font-aeonik min-h-24 resize-none"
                                                    required
                                                />
                                            </div>

                                            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => navigate("/tasks")}
                                                    className="bg-transparent border-border text-sidebar-foreground hover:bg-accent rounded-xl h-12 px-6 font-aeonik"
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    type="submit"
                                                    disabled={isLoading}
                                                    className="bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground rounded-xl h-12 px-6 font-aeonik flex-1"
                                                >
                                                    {isLoading ? "Creating Task..." : "Create Task"}
                                                </Button>
                                            </div>
                                        </form>
                                    </CardContent>
                                </Card>
                            </div>
                        </main>
                    </SidebarInset>
                </div>
            </SidebarProvider>
        </ErrorBoundary>
    );
}