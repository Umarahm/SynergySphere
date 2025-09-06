import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Calendar, User, Clock, MoreVertical, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { TaskBreadcrumb } from "@/components/TaskBreadcrumb";
import { useAuth } from "@/hooks/useAuth";
import { Task, TaskStatus } from "@shared/api";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default function Tasks() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const navigate = useNavigate();
    const { user, token } = useAuth();

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const response = await fetch("/api/tasks", {
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setTasks(data.tasks || []);
                } else {
                    setError(data.message);
                }
            } else {
                setError("Failed to fetch tasks");
            }
        } catch (error) {
            console.error("Error fetching tasks:", error);
            setError("An error occurred while fetching tasks");
        } finally {
            setIsLoading(false);
        }
    };

    const updateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
        try {
            const response = await fetch(`/api/tasks/${taskId}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    // Update the task in the local state
                    setTasks(prevTasks =>
                        prevTasks.map(task =>
                            task.id === taskId ? { ...task, status: newStatus } : task
                        )
                    );
                } else {
                    console.error("Failed to update task status:", data.message);
                }
            } else {
                console.error("Failed to update task status");
            }
        } catch (error) {
            console.error("Error updating task status:", error);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const getStatusColor = (status: TaskStatus) => {
        switch (status) {
            case "new_task":
                return "bg-blue-500/10 text-blue-500 border-blue-500/20";
            case "in_progress":
                return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
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

    const isOverdue = (deadline: string) => {
        return new Date(deadline) < new Date();
    };

    const canCreateTask = user?.role === "project_manager";
    const isEmployee = user?.role === "employee";

    const filteredTasks = tasks.filter(task => {
        if (filterStatus === "all") return true;
        return task.status === filterStatus;
    });

    const getAvailableStatuses = (currentStatus: TaskStatus): TaskStatus[] => {
        if (isEmployee) {
            // Employees can only progress their tasks forward
            switch (currentStatus) {
                case "new_task":
                    return ["in_progress"];
                case "in_progress":
                    return ["completed"];
                case "completed":
                    return []; // Cannot change from completed
                case "approved":
                    return []; // Cannot change from approved
                default:
                    return [];
            }
        } else {
            // Project managers can approve completed tasks
            switch (currentStatus) {
                case "completed":
                    return ["approved"];
                default:
                    return [];
            }
        }
    };

    if (isLoading) {
        return (
            <SidebarProvider>
                <div className="flex min-h-screen bg-background">
                    <Sidebar />
                    <SidebarInset className="flex-1">
                        <Header />
                        <main className="flex-1 p-4 md:p-6 lg:p-8">
                            <div className="flex items-center justify-center py-12">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-sidebar-primary rounded-full flex items-center justify-center animate-pulse">
                                        <div className="w-4 h-4 bg-sidebar-primary-foreground rounded-full"></div>
                                    </div>
                                    <span className="text-sidebar-foreground font-aeonik text-lg font-medium">
                                        Loading tasks...
                                    </span>
                                </div>
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
                    <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-full">
                        <TaskBreadcrumb />

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                            <div>
                                <h1 className="text-sidebar-foreground font-aeonik text-3xl font-medium mb-2">
                                    {isEmployee ? "My Tasks" : "Tasks"}
                                </h1>
                                <p className="text-sidebar-foreground/70 font-aeonik text-sm">
                                    {isEmployee
                                        ? "Track and manage your assigned tasks"
                                        : "Manage and track all tasks you've created"
                                    }
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <Select value={filterStatus} onValueChange={setFilterStatus}>
                                    <SelectTrigger className="w-full sm:w-48 bg-card border-border text-sidebar-foreground rounded-xl h-12">
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Tasks</SelectItem>
                                        <SelectItem value="new_task">New Tasks</SelectItem>
                                        <SelectItem value="in_progress">In Progress</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                    </SelectContent>
                                </Select>

                                {canCreateTask && (
                                    <Button
                                        onClick={() => navigate("/tasks/new")}
                                        className="bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground rounded-xl h-12 px-6 font-aeonik whitespace-nowrap"
                                    >
                                        <Plus className="w-5 h-5 mr-2" />
                                        Create Task
                                    </Button>
                                )}
                            </div>
                        </div>

                        {error && (
                            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 mb-6">
                                <p className="text-destructive font-aeonik text-sm">{error}</p>
                            </div>
                        )}

                        {filteredTasks.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-sidebar-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="w-8 h-8 text-sidebar-accent" />
                                </div>
                                <h3 className="text-sidebar-foreground font-aeonik text-lg font-medium mb-2">
                                    {filterStatus === "all" ? "No tasks found" : `No ${filterStatus.replace("_", " ")} tasks`}
                                </h3>
                                <p className="text-sidebar-foreground/70 font-aeonik text-sm mb-6">
                                    {canCreateTask
                                        ? "Get started by creating your first task"
                                        : "You don't have any tasks assigned yet"
                                    }
                                </p>
                                {canCreateTask && (
                                    <Button
                                        onClick={() => navigate("/tasks/new")}
                                        className="bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground rounded-xl h-12 px-6 font-aeonik"
                                    >
                                        <Plus className="w-5 h-5 mr-2" />
                                        Create Task
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="grid gap-6 xl:grid-cols-2 2xl:grid-cols-3">
                                {filteredTasks.map((task) => (
                                    <Card key={task.id} className="bg-card border-border hover:shadow-md transition-shadow">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <CardTitle className="text-sidebar-foreground font-aeonik text-lg font-medium mb-1 line-clamp-2">
                                                        {task.name}
                                                    </CardTitle>
                                                    <CardDescription className="text-sidebar-foreground/70 font-aeonik text-sm line-clamp-2">
                                                        {task.description}
                                                    </CardDescription>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            onClick={() => navigate(`/tasks/${task.id}`)}
                                                        >
                                                            View Details
                                                        </DropdownMenuItem>
                                                        {getAvailableStatuses(task.status).map((status) => (
                                                            <DropdownMenuItem
                                                                key={status}
                                                                onClick={() => updateTaskStatus(task.id, status)}
                                                            >
                                                                Mark as {getStatusLabel(status)}
                                                            </DropdownMenuItem>
                                                        ))}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </CardHeader>

                                        <CardContent className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <Badge
                                                    className={`${getStatusColor(task.status)} border rounded-xl font-aeonik text-xs px-3 py-1`}
                                                >
                                                    {getStatusLabel(task.status)}
                                                </Badge>
                                                {isOverdue(task.deadline) && task.status !== "completed" && task.status !== "approved" && (
                                                    <Badge className="bg-red-500/10 text-red-600 border-red-500/20 border rounded-xl font-aeonik text-xs px-3 py-1">
                                                        Overdue
                                                    </Badge>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-sidebar-foreground/70">
                                                    <User className="w-4 h-4" />
                                                    <span className="font-aeonik text-sm">
                                                        {isEmployee ? task.created_by_name : task.assignee_name}
                                                    </span>
                                                </div>

                                                {task.project_name && (
                                                    <div className="flex items-center gap-2 text-sidebar-foreground/70">
                                                        <Clock className="w-4 h-4" />
                                                        <span className="font-aeonik text-sm">
                                                            {task.project_name}
                                                        </span>
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-2 text-sidebar-foreground/70">
                                                    <Calendar className="w-4 h-4" />
                                                    <span className="font-aeonik text-sm">
                                                        Due {formatDate(task.deadline)}
                                                    </span>
                                                </div>
                                            </div>

                                            {task.tags && task.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {task.tags.slice(0, 3).map((tag, index) => (
                                                        <Badge
                                                            key={index}
                                                            variant="outline"
                                                            className="border-sidebar-accent/30 text-sidebar-accent rounded-lg font-aeonik text-xs px-2 py-1"
                                                        >
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                    {task.tags.length > 3 && (
                                                        <Badge
                                                            variant="outline"
                                                            className="border-sidebar-foreground/30 text-sidebar-foreground/70 rounded-lg font-aeonik text-xs px-2 py-1"
                                                        >
                                                            +{task.tags.length - 3}
                                                        </Badge>
                                                    )}
                                                </div>
                                            )}
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