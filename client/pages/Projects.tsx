import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Calendar, Users, MoreVertical, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProjectBreadcrumb } from "@/components/ProjectBreadcrumb";
import { useAuth } from "@/hooks/useAuth";
import { Project } from "@shared/api";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default function Projects() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { user, token } = useAuth();

    useEffect(() => {
        fetchProjects();
    }, []);

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
                    setProjects(data.projects || []);
                } else {
                    setError(data.message || "Failed to fetch projects");
                }
            } else {
                setError("Failed to fetch projects");
            }
        } catch (err) {
            setError("Error fetching projects");
            console.error("Error fetching projects:", err);
        } finally {
            setIsLoading(false);
        }
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
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const canCreateProject = user?.role === "project_manager";

    return (
        <SidebarProvider>
            <div className="flex min-h-screen bg-background">
                <Sidebar />
                <SidebarInset className="flex-1">
                    <Header />
                    <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-full">
                        <ProjectBreadcrumb />

                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h1 className="text-sidebar-foreground font-aeonik text-3xl font-medium mb-2">
                                    Projects
                                </h1>
                                <p className="text-sidebar-foreground/70 font-aeonik text-sm">
                                    Manage and track all your assigned projects
                                </p>
                            </div>

                            {canCreateProject && (
                                <Button
                                    onClick={() => navigate("/projects/new")}
                                    className="bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground rounded-xl h-12 px-6 font-aeonik"
                                >
                                    <Plus className="w-5 h-5 mr-2" />
                                    New Project
                                </Button>
                            )}
                        </div>

                        {error && (
                            <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4 mb-6">
                                <p className="text-destructive text-sm font-aeonik">{error}</p>
                            </div>
                        )}

                        {isLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 max-w-full">
                                {[...Array(6)].map((_, i) => (
                                    <Card key={i} className="animate-pulse">
                                        <CardHeader>
                                            <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                                            <div className="h-4 bg-muted rounded w-1/2"></div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="h-4 bg-muted rounded mb-2"></div>
                                            <div className="h-4 bg-muted rounded w-2/3"></div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : projects.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-sidebar-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Users className="w-8 h-8 text-sidebar-accent" />
                                </div>
                                <h3 className="text-sidebar-foreground font-aeonik text-lg font-medium mb-2">
                                    No projects yet
                                </h3>
                                <p className="text-sidebar-foreground/70 font-aeonik text-sm mb-6">
                                    {canCreateProject
                                        ? "Create your first project to get started"
                                        : "No projects have been assigned to you yet"
                                    }
                                </p>
                                {canCreateProject && (
                                    <Button
                                        onClick={() => navigate("/projects/new")}
                                        className="bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground rounded-xl h-10 px-4 font-aeonik"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Create Project
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 max-w-full">
                                {projects.map((project) => (
                                    <Card
                                        key={project.id}
                                        className="bg-card border-border hover:shadow-lg transition-shadow cursor-pointer max-w-sm"
                                        onClick={() => navigate(`/projects/${project.id}`)}
                                    >
                                        <CardHeader className="pb-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <CardTitle className="text-sidebar-foreground font-aeonik text-lg font-medium mb-1 line-clamp-1">
                                                        {project.name}
                                                    </CardTitle>
                                                    <CardDescription className="text-sidebar-foreground/70 font-aeonik text-sm line-clamp-2">
                                                        {project.description}
                                                    </CardDescription>
                                                </div>
                                                <Badge className={`ml-2 ${getPriorityColor(project.priority)} border-0`}>
                                                    {project.priority}
                                                </Badge>
                                            </div>
                                        </CardHeader>

                                        <CardContent className="pt-0">
                                            {project.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mb-4">
                                                    {project.tags.slice(0, 3).map((tag, index) => (
                                                        <Badge
                                                            key={index}
                                                            variant="outline"
                                                            className="text-xs font-aeonik bg-sidebar-accent/10 text-sidebar-accent border-sidebar-accent/20"
                                                        >
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                    {project.tags.length > 3 && (
                                                        <Badge
                                                            variant="outline"
                                                            className="text-xs font-aeonik bg-sidebar-accent/10 text-sidebar-accent border-sidebar-accent/20"
                                                        >
                                                            +{project.tags.length - 3}
                                                        </Badge>
                                                    )}
                                                </div>
                                            )}

                                            <div className="space-y-2 text-xs">
                                                <div className="flex items-center text-sidebar-foreground/60">
                                                    <Calendar className="w-3 h-3 mr-2" />
                                                    <span className="font-aeonik">Due {formatDate(project.deadline)}</span>
                                                </div>
                                                <div className="flex items-center text-sidebar-foreground/60">
                                                    <Users className="w-3 h-3 mr-2" />
                                                    <span className="font-aeonik">{project.project_manager_name || "Unknown"}</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
}