import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, User, Tag, Image, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProjectBreadcrumb } from "@/components/ProjectBreadcrumb";
import { useAuth } from "@/hooks/useAuth";
import { User as UserType, CreateProjectData } from "@shared/api";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default function NewProject() {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [newTag, setNewTag] = useState("");
    const [projectManager, setProjectManager] = useState("");
    const [deadline, setDeadline] = useState("");
    const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
    const [imageUrl, setImageUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [projectManagers, setProjectManagers] = useState<UserType[]>([]);

    const navigate = useNavigate();
    const { user, token } = useAuth();

    useEffect(() => {
        // Check if user is project manager
        if (user?.role !== "project_manager") {
            navigate("/projects");
            return;
        }

        fetchProjectManagers();
    }, [user, navigate]);

    const fetchProjectManagers = async () => {
        try {
            const response = await fetch("/api/users?role=project_manager", {
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setProjectManagers(data.users || []);
                    // Set current user as default project manager
                    if (user?.id) {
                        setProjectManager(user.id);
                    }
                }
            }
        } catch (err) {
            console.error("Error fetching project managers:", err);
        }
    };

    const handleAddTag = () => {
        if (newTag.trim() && !tags.includes(newTag.trim())) {
            setTags([...tags, newTag.trim()]);
            setNewTag("");
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAddTag();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const projectData: CreateProjectData = {
                name,
                description,
                tags,
                project_manager: projectManager,
                deadline: new Date(deadline),
                priority,
                image_url: imageUrl || undefined,
            };

            const response = await fetch("/api/projects", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(projectData),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    navigate("/projects");
                } else {
                    setError(data.message || "Failed to create project");
                }
            } else {
                setError("Failed to create project");
            }
        } catch (err) {
            setError("Error creating project");
            console.error("Error creating project:", err);
        } finally {
            setIsLoading(false);
        }
    };

    // Redirect if not project manager
    if (user?.role !== "project_manager") {
        return null;
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
                                    Create New Project
                                </h1>
                                <p className="text-sidebar-foreground/70 font-aeonik text-sm">
                                    Set up a new project with all the necessary details
                                </p>
                            </div>
                        </div>

                        <div className="max-w-2xl">
                            <Card className="bg-card border-border">
                                <CardHeader>
                                    <CardTitle className="text-sidebar-foreground font-aeonik text-xl font-medium">
                                        Project Details
                                    </CardTitle>
                                    <CardDescription className="text-sidebar-foreground/70 font-aeonik text-sm">
                                        Fill in the information below to create your new project
                                    </CardDescription>
                                </CardHeader>

                                <CardContent>
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {error && (
                                            <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4 flex items-start gap-3">
                                                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                                                <p className="text-destructive text-sm font-aeonik">{error}</p>
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="text-sidebar-foreground font-aeonik text-sm font-medium">
                                                Project Name *
                                            </Label>
                                            <Input
                                                id="name"
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="bg-background border-border rounded-xl h-12 px-4 font-aeonik"
                                                placeholder="Enter project name"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="description" className="text-sidebar-foreground font-aeonik text-sm font-medium">
                                                Description *
                                            </Label>
                                            <Textarea
                                                id="description"
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                className="bg-background border-border rounded-xl px-4 py-3 font-aeonik min-h-[100px] resize-none"
                                                placeholder="Describe the project goals and requirements"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sidebar-foreground font-aeonik text-sm font-medium">
                                                Tags
                                            </Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    type="text"
                                                    value={newTag}
                                                    onChange={(e) => setNewTag(e.target.value)}
                                                    onKeyPress={handleKeyPress}
                                                    className="bg-background border-border rounded-xl h-10 px-3 font-aeonik"
                                                    placeholder="Add a tag and press Enter"
                                                />
                                                <Button
                                                    type="button"
                                                    onClick={handleAddTag}
                                                    variant="outline"
                                                    size="sm"
                                                    className="bg-transparent border-border text-sidebar-foreground hover:bg-accent rounded-xl h-10 px-4"
                                                >
                                                    <Tag className="w-4 h-4 mr-1" />
                                                    Add
                                                </Button>
                                            </div>
                                            {tags.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    {tags.map((tag, index) => (
                                                        <Badge
                                                            key={index}
                                                            variant="outline"
                                                            className="bg-sidebar-accent/10 text-sidebar-accent border-sidebar-accent/20 font-aeonik cursor-pointer hover:bg-sidebar-accent/20 transition-colors"
                                                            onClick={() => handleRemoveTag(tag)}
                                                        >
                                                            {tag} ×
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="project_manager" className="text-sidebar-foreground font-aeonik text-sm font-medium">
                                                Project Manager *
                                            </Label>
                                            <Select value={projectManager} onValueChange={setProjectManager}>
                                                <SelectTrigger className="bg-background border-border rounded-xl h-12 px-4 font-aeonik">
                                                    <SelectValue placeholder="Select project manager" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {projectManagers.map((manager) => (
                                                        <SelectItem key={manager.id} value={manager.id}>
                                                            <div className="flex items-center gap-2">
                                                                <User className="w-4 h-4" />
                                                                {manager.name} ({manager.email})
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="deadline" className="text-sidebar-foreground font-aeonik text-sm font-medium">
                                                    Deadline *
                                                </Label>
                                                <Input
                                                    id="deadline"
                                                    type="date"
                                                    value={deadline}
                                                    onChange={(e) => setDeadline(e.target.value)}
                                                    className="bg-background border-border rounded-xl h-12 px-4 font-aeonik"
                                                    min={new Date().toISOString().split('T')[0]}
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="priority" className="text-sidebar-foreground font-aeonik text-sm font-medium">
                                                    Priority *
                                                </Label>
                                                <Select value={priority} onValueChange={(value: "low" | "medium" | "high") => setPriority(value)}>
                                                    <SelectTrigger className="bg-background border-border rounded-xl h-12 px-4 font-aeonik">
                                                        <SelectValue placeholder="Select priority" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="low">
                                                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-0">
                                                                Low
                                                            </Badge>
                                                        </SelectItem>
                                                        <SelectItem value="medium">
                                                            <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-0">
                                                                Medium
                                                            </Badge>
                                                        </SelectItem>
                                                        <SelectItem value="high">
                                                            <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-0">
                                                                High
                                                            </Badge>
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="image_url" className="text-sidebar-foreground font-aeonik text-sm font-medium">
                                                Project Image URL (Optional)
                                            </Label>
                                            <Input
                                                id="image_url"
                                                type="url"
                                                value={imageUrl}
                                                onChange={(e) => setImageUrl(e.target.value)}
                                                className="bg-background border-border rounded-xl h-12 px-4 font-aeonik"
                                                placeholder="https://example.com/image.jpg"
                                            />
                                        </div>

                                        <div className="flex gap-4 pt-4">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => navigate("/projects")}
                                                className="bg-transparent border-border text-sidebar-foreground hover:bg-accent rounded-xl h-12 px-6 font-aeonik"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={isLoading || !name || !description || !projectManager || !deadline}
                                                className="bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground rounded-xl h-12 px-6 font-aeonik"
                                            >
                                                {isLoading ? "Creating..." : "Create Project"}
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
    );
}