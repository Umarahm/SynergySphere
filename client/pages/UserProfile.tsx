import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { User, UpdateUserProfileData, UserProfileResponse, Project, Task, ProjectsResponse, TasksResponse } from '@shared/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Edit2, Save, X, User as UserIcon, Mail, Phone, Building, Calendar, Briefcase, CheckSquare, Clock, Tag } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';

export default function UserProfile() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user: currentUser, token } = useAuth();
    const [profileUser, setProfileUser] = useState<User | null>(null);
    const [userProjects, setUserProjects] = useState<Project[]>([]);
    const [userTasks, setUserTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProjectsLoading, setIsProjectsLoading] = useState(false);
    const [isTasksLoading, setIsTasksLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<UpdateUserProfileData>({});

    const profileId = id || currentUser?.id;
    const isOwnProfile = profileId === currentUser?.id;
    const canEdit = isOwnProfile || currentUser?.role === 'project_manager';

    useEffect(() => {
        if (!profileId) {
            navigate('/dashboard');
            return;
        }

        fetchUserProfile();

        // Only fetch projects and tasks if current user is project manager and viewing another user's profile
        if (currentUser?.role === 'project_manager' && profileId !== currentUser.id) {
            fetchUserProjects();
            fetchUserTasks();
        }
    }, [profileId, token]);

    const fetchUserProfile = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch(`/api/users/${profileId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data: UserProfileResponse = await response.json();

            if (!data.success) {
                throw new Error(data.message);
            }

            setProfileUser(data.user!);
            setEditForm({
                name: data.user!.name,
                email: data.user!.email,
                phone: data.user!.phone || '',
                department: data.user!.department || '',
                bio: data.user!.bio || '',
                avatar_url: data.user!.avatar_url || ''
            });
        } catch (error) {
            console.error('Error fetching user profile:', error);
            setError(error instanceof Error ? error.message : 'Failed to load user profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!canEdit || !profileId) return;

        try {
            setIsSaving(true);
            setError(null);

            const response = await fetch(`/api/users/${profileId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editForm)
            });

            const data: UserProfileResponse = await response.json();

            if (!data.success) {
                throw new Error(data.message);
            }

            setProfileUser(data.user!);
            setIsEditing(false);
            toast({
                title: 'Profile Updated',
                description: 'User profile has been updated successfully.',
            });
        } catch (error) {
            console.error('Error updating profile:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
            setError(errorMessage);
            toast({
                title: 'Update Failed',
                description: errorMessage,
                variant: 'destructive',
            });
        } finally {
            setIsSaving(false);
        }
    };

    const fetchUserProjects = async () => {
        if (!profileId || currentUser?.role !== 'project_manager') return;

        try {
            setIsProjectsLoading(true);

            const response = await fetch(`/api/users/${profileId}/projects`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data: ProjectsResponse = await response.json();

            if (data.success) {
                setUserProjects(data.projects || []);
            } else {
                console.error('Failed to fetch user projects:', data.message);
            }
        } catch (error) {
            console.error('Error fetching user projects:', error);
        } finally {
            setIsProjectsLoading(false);
        }
    };

    const fetchUserTasks = async () => {
        if (!profileId || currentUser?.role !== 'project_manager') return;

        try {
            setIsTasksLoading(true);

            const response = await fetch(`/api/users/${profileId}/tasks`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data: TasksResponse = await response.json();

            if (data.success) {
                setUserTasks(data.tasks || []);
            } else {
                console.error('Failed to fetch user tasks:', data.message);
            }
        } catch (error) {
            console.error('Error fetching user tasks:', error);
        } finally {
            setIsTasksLoading(false);
        }
    };

    const handleCancel = () => {
        if (!profileUser) return;

        setEditForm({
            name: profileUser.name,
            email: profileUser.email,
            phone: profileUser.phone || '',
            department: profileUser.department || '',
            bio: profileUser.bio || '',
            avatar_url: profileUser.avatar_url || ''
        });
        setIsEditing(false);
        setError(null);
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getRoleColor = (role?: string) => {
        switch (role) {
            case 'project_manager':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'employee':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
        }
    };

    const formatRole = (role?: string) => {
        switch (role) {
            case 'project_manager':
                return 'Project Manager';
            case 'employee':
                return 'Employee';
            default:
                return 'User';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'low':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
            case 'approved':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            case 'new_task':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
        }
    };

    const formatTaskStatus = (status: string) => {
        switch (status) {
            case 'new_task':
                return 'New Task';
            case 'in_progress':
                return 'In Progress';
            case 'completed':
                return 'Completed';
            case 'approved':
                return 'Approved';
            default:
                return status;
        }
    };

    const formatDate = (dateString: Date) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (isLoading) {
        return (
            <SidebarProvider>
                <Sidebar />
                <SidebarInset>
                    <Header />
                    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 lg:p-8">
                        <div className="flex items-center justify-center min-h-[400px]">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                                <p className="text-muted-foreground">Loading profile...</p>
                            </div>
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        );
    }

    if (error && !profileUser) {
        return (
            <SidebarProvider>
                <Sidebar />
                <SidebarInset>
                    <Header />
                    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 lg:p-8">
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        );
    }

    if (!profileUser) {
        return (
            <SidebarProvider>
                <Sidebar />
                <SidebarInset>
                    <Header />
                    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 lg:p-8">
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>User profile not found.</AlertDescription>
                        </Alert>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        );
    }

    return (
        <SidebarProvider>
            <Sidebar />
            <SidebarInset>
                <Header />
                <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 lg:p-8">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {isOwnProfile ? 'My Profile' : `${profileUser.name}'s Profile`}
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                {isOwnProfile ? 'Manage your account information' : 'View user profile information'}
                            </p>
                        </div>
                        {canEdit && !isEditing && (
                            <Button
                                onClick={() => setIsEditing(true)}
                                className="w-fit"
                            >
                                <Edit2 className="h-4 w-4 mr-2" />
                                Edit Profile
                            </Button>
                        )}
                    </div>

                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Profile Card */}
                        <div className="lg:col-span-1">
                            <Card>
                                <CardHeader className="text-center">
                                    <div className="flex justify-center mb-4">
                                        <Avatar className="h-24 w-24">
                                            <AvatarImage src={profileUser.avatar_url} alt={profileUser.name} />
                                            <AvatarFallback className="text-lg bg-gradient-to-br from-orange-400 to-orange-600 text-white">
                                                {getInitials(profileUser.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>
                                    <CardTitle className="text-xl">{profileUser.name}</CardTitle>
                                    <CardDescription className="flex items-center justify-center gap-2">
                                        <Badge className={getRoleColor(profileUser.role)}>
                                            {formatRole(profileUser.role)}
                                        </Badge>
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-sm">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-muted-foreground">{profileUser.email}</span>
                                        </div>
                                        {profileUser.phone && (
                                            <div className="flex items-center gap-3 text-sm">
                                                <Phone className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-muted-foreground">{profileUser.phone}</span>
                                            </div>
                                        )}
                                        {profileUser.department && (
                                            <div className="flex items-center gap-3 text-sm">
                                                <Building className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-muted-foreground">{profileUser.department}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-3 text-sm">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-muted-foreground">
                                                Joined {formatDate(profileUser.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Enhanced Profile with Tabs for Project Managers */}
                        <div className="lg:col-span-2">
                            {currentUser?.role === 'project_manager' && !isOwnProfile ? (
                                // Project Manager View with Tabs
                                <Tabs defaultValue="profile" className="w-full">
                                    <TabsList className="grid w-full grid-cols-4">
                                        <TabsTrigger value="profile">Profile</TabsTrigger>
                                        <TabsTrigger value="projects">Projects</TabsTrigger>
                                        <TabsTrigger value="tasks">Tasks</TabsTrigger>
                                        <TabsTrigger value="history">History</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="profile" className="space-y-4">
                                        <Card>
                                            <CardHeader>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <CardTitle>Profile Information</CardTitle>
                                                        <CardDescription>
                                                            User profile details for {profileUser.name}
                                                        </CardDescription>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-6">
                                                <div className="space-y-4">
                                                    <div className="grid gap-6 sm:grid-cols-2">
                                                        <div>
                                                            <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                                                            <p className="mt-1 text-sm">{profileUser.name}</p>
                                                        </div>
                                                        <div>
                                                            <Label className="text-sm font-medium text-muted-foreground">Email Address</Label>
                                                            <p className="mt-1 text-sm">{profileUser.email}</p>
                                                        </div>
                                                    </div>

                                                    <div className="grid gap-6 sm:grid-cols-2">
                                                        <div>
                                                            <Label className="text-sm font-medium text-muted-foreground">Phone Number</Label>
                                                            <p className="mt-1 text-sm">{profileUser.phone || 'Not provided'}</p>
                                                        </div>
                                                        <div>
                                                            <Label className="text-sm font-medium text-muted-foreground">Department</Label>
                                                            <p className="mt-1 text-sm">{profileUser.department || 'Not specified'}</p>
                                                        </div>
                                                    </div>

                                                    <Separator />

                                                    <div>
                                                        <Label className="text-sm font-medium text-muted-foreground">Bio</Label>
                                                        <p className="mt-1 text-sm whitespace-pre-wrap">
                                                            {profileUser.bio || 'No bio provided.'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </TabsContent>

                                    <TabsContent value="projects" className="space-y-4">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <Briefcase className="h-5 w-5" />
                                                    Projects ({userProjects.length})
                                                </CardTitle>
                                                <CardDescription>
                                                    {profileUser.role === 'project_manager'
                                                        ? `Projects managed by ${profileUser.name}`
                                                        : `Projects where ${profileUser.name} has assigned tasks`
                                                    }
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                {isProjectsLoading ? (
                                                    <div className="flex items-center justify-center py-8">
                                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                                                    </div>
                                                ) : userProjects.length === 0 ? (
                                                    <div className="text-center py-8">
                                                        <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                                        <p className="text-muted-foreground">
                                                            {profileUser.role === 'project_manager'
                                                                ? 'No projects managed yet'
                                                                : 'No projects assigned yet'
                                                            }
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-4">
                                                        {userProjects.map((project) => (
                                                            <Card key={project.id} className="cursor-pointer hover:shadow-md transition-shadow"
                                                                onClick={() => navigate(`/projects/${project.id}`)}>
                                                                <CardContent className="p-4">
                                                                    <div className="flex items-start justify-between">
                                                                        <div className="flex-1">
                                                                            <h4 className="font-medium text-sm mb-1">{project.name}</h4>
                                                                            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                                                                {project.description}
                                                                            </p>
                                                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                                <Calendar className="h-3 w-3" />
                                                                                Due {formatDate(project.deadline)}
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex flex-col items-end gap-2 ml-4">
                                                                            <Badge className={getPriorityColor(project.priority)}>
                                                                                {project.priority}
                                                                            </Badge>
                                                                            <span className="text-xs text-muted-foreground">
                                                                                {project.completion_percentage}% complete
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    {project.tags.length > 0 && (
                                                                        <div className="flex flex-wrap gap-1 mt-2">
                                                                            {project.tags.slice(0, 3).map((tag, index) => (
                                                                                <Badge key={index} variant="outline" className="text-xs">
                                                                                    {tag}
                                                                                </Badge>
                                                                            ))}
                                                                            {project.tags.length > 3 && (
                                                                                <Badge variant="outline" className="text-xs">
                                                                                    +{project.tags.length - 3}
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </CardContent>
                                                            </Card>
                                                        ))}
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </TabsContent>

                                    <TabsContent value="tasks" className="space-y-4">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <CheckSquare className="h-5 w-5" />
                                                    Tasks ({userTasks.length})
                                                </CardTitle>
                                                <CardDescription>
                                                    {profileUser.role === 'project_manager'
                                                        ? `Tasks created by ${profileUser.name}`
                                                        : `Tasks assigned to ${profileUser.name}`
                                                    }
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                {isTasksLoading ? (
                                                    <div className="flex items-center justify-center py-8">
                                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                                                    </div>
                                                ) : userTasks.length === 0 ? (
                                                    <div className="text-center py-8">
                                                        <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                                        <p className="text-muted-foreground">
                                                            {profileUser.role === 'project_manager'
                                                                ? 'No tasks created yet'
                                                                : 'No tasks assigned yet'
                                                            }
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-4">
                                                        {userTasks.map((task) => (
                                                            <Card key={task.id} className="cursor-pointer hover:shadow-md transition-shadow"
                                                                onClick={() => navigate(`/tasks/${task.id}`)}>
                                                                <CardContent className="p-4">
                                                                    <div className="flex items-start justify-between">
                                                                        <div className="flex-1">
                                                                            <h4 className="font-medium text-sm mb-1">{task.name}</h4>
                                                                            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                                                                {task.description}
                                                                            </p>
                                                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                                                <div className="flex items-center gap-1">
                                                                                    <Calendar className="h-3 w-3" />
                                                                                    Due {formatDate(task.deadline)}
                                                                                </div>
                                                                                {task.project_name && (
                                                                                    <div className="flex items-center gap-1">
                                                                                        <Briefcase className="h-3 w-3" />
                                                                                        {task.project_name}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex flex-col items-end gap-2 ml-4">
                                                                            <Badge className={getStatusColor(task.status)}>
                                                                                {formatTaskStatus(task.status)}
                                                                            </Badge>
                                                                        </div>
                                                                    </div>
                                                                    {task.tags.length > 0 && (
                                                                        <div className="flex flex-wrap gap-1 mt-2">
                                                                            {task.tags.slice(0, 3).map((tag, index) => (
                                                                                <Badge key={index} variant="outline" className="text-xs">
                                                                                    {tag}
                                                                                </Badge>
                                                                            ))}
                                                                            {task.tags.length > 3 && (
                                                                                <Badge variant="outline" className="text-xs">
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
                                            </CardContent>
                                        </Card>
                                    </TabsContent>

                                    <TabsContent value="history" className="space-y-4">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <Clock className="h-5 w-5" />
                                                    Activity History
                                                </CardTitle>
                                                <CardDescription>
                                                    Timeline of {profileUser.name}'s account activity
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-4">
                                                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                                                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium">Account Created</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                Joined the platform as {formatRole(profileUser.role)}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                {formatDate(profileUser.created_at)}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {userProjects.length > 0 && (
                                                        <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                                                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                                            <div className="flex-1">
                                                                <p className="text-sm font-medium">
                                                                    {profileUser.role === 'project_manager'
                                                                        ? `Managing ${userProjects.length} project${userProjects.length !== 1 ? 's' : ''}`
                                                                        : `Active in ${userProjects.length} project${userProjects.length !== 1 ? 's' : ''}`
                                                                    }
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {profileUser.role === 'project_manager'
                                                                        ? 'Currently managing multiple projects'
                                                                        : 'Participating in project activities'
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {userTasks.length > 0 && (
                                                        <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                                                            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                                                            <div className="flex-1">
                                                                <p className="text-sm font-medium">
                                                                    {profileUser.role === 'project_manager'
                                                                        ? `Created ${userTasks.length} task${userTasks.length !== 1 ? 's' : ''}`
                                                                        : `Assigned ${userTasks.length} task${userTasks.length !== 1 ? 's' : ''}`
                                                                    }
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {profileUser.role === 'project_manager'
                                                                        ? 'Total tasks created for team members'
                                                                        : 'Total tasks received from project managers'
                                                                    }
                                                                </p>
                                                                <p className="text-xs text-muted-foreground mt-1">
                                                                    Completed: {userTasks.filter(t => t.status === 'completed' || t.status === 'approved').length} / {userTasks.length}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {profileUser.department && (
                                                        <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                                                            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                                                            <div className="flex-1">
                                                                <p className="text-sm font-medium">Department Assignment</p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    Member of {profileUser.department} department
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </TabsContent>
                                </Tabs>
                            ) : (
                                // Regular Profile View (for own profile or non-project managers)
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle>Profile Information</CardTitle>
                                                <CardDescription>
                                                    {isEditing ? 'Update profile information' : 'User profile details'}
                                                </CardDescription>
                                            </div>
                                            {canEdit && !isEditing && (
                                                <Button
                                                    onClick={() => setIsEditing(true)}
                                                    size="sm"
                                                >
                                                    <Edit2 className="h-4 w-4 mr-2" />
                                                    Edit Profile
                                                </Button>
                                            )}
                                            {isEditing && (
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={handleCancel}
                                                        disabled={isSaving}
                                                    >
                                                        <X className="h-4 w-4 mr-2" />
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        onClick={handleSave}
                                                        disabled={isSaving}
                                                    >
                                                        <Save className="h-4 w-4 mr-2" />
                                                        {isSaving ? 'Saving...' : 'Save'}
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {isEditing ? (
                                            // Edit Form
                                            <div className="space-y-4">
                                                <div className="grid gap-4 sm:grid-cols-2">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="name">Full Name *</Label>
                                                        <Input
                                                            id="name"
                                                            value={editForm.name || ''}
                                                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                            placeholder="Enter full name"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="email">Email Address *</Label>
                                                        <Input
                                                            id="email"
                                                            type="email"
                                                            value={editForm.email || ''}
                                                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                                            placeholder="Enter email address"
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid gap-4 sm:grid-cols-2">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="phone">Phone Number</Label>
                                                        <Input
                                                            id="phone"
                                                            type="tel"
                                                            value={editForm.phone || ''}
                                                            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                                            placeholder="Enter phone number"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="department">Department</Label>
                                                        <Input
                                                            id="department"
                                                            value={editForm.department || ''}
                                                            onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                                                            placeholder="Enter department"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="avatar_url">Avatar URL</Label>
                                                    <Input
                                                        id="avatar_url"
                                                        type="url"
                                                        value={editForm.avatar_url || ''}
                                                        onChange={(e) => setEditForm({ ...editForm, avatar_url: e.target.value })}
                                                        placeholder="Enter avatar image URL"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="bio">Bio</Label>
                                                    <Textarea
                                                        id="bio"
                                                        value={editForm.bio || ''}
                                                        onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                                                        placeholder="Tell us about yourself..."
                                                        rows={4}
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            // View Mode
                                            <div className="space-y-4">
                                                <div className="grid gap-6 sm:grid-cols-2">
                                                    <div>
                                                        <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                                                        <p className="mt-1 text-sm">{profileUser.name}</p>
                                                    </div>
                                                    <div>
                                                        <Label className="text-sm font-medium text-muted-foreground">Email Address</Label>
                                                        <p className="mt-1 text-sm">{profileUser.email}</p>
                                                    </div>
                                                </div>

                                                <div className="grid gap-6 sm:grid-cols-2">
                                                    <div>
                                                        <Label className="text-sm font-medium text-muted-foreground">Phone Number</Label>
                                                        <p className="mt-1 text-sm">{profileUser.phone || 'Not provided'}</p>
                                                    </div>
                                                    <div>
                                                        <Label className="text-sm font-medium text-muted-foreground">Department</Label>
                                                        <p className="mt-1 text-sm">{profileUser.department || 'Not specified'}</p>
                                                    </div>
                                                </div>

                                                <Separator />

                                                <div>
                                                    <Label className="text-sm font-medium text-muted-foreground">Bio</Label>
                                                    <p className="mt-1 text-sm whitespace-pre-wrap">
                                                        {profileUser.bio || 'No bio provided.'}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}