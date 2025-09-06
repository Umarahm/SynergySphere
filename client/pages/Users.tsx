import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { User, AllUsersResponse } from '@shared/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertCircle, User as UserIcon, Mail, Phone, Building, Calendar, Users as UsersIcon } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';

export default function Users() {
    const navigate = useNavigate();
    const { user: currentUser, token } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Only project managers can access this page
    useEffect(() => {
        if (currentUser?.role !== 'project_manager') {
            navigate('/dashboard');
            return;
        }

        fetchUsers();
    }, [currentUser, token, navigate]);

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch('/api/users', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data: AllUsersResponse = await response.json();

            if (!data.success) {
                throw new Error(data.message);
            }

            setUsers(data.users || []);
        } catch (error) {
            console.error('Error fetching users:', error);
            setError(error instanceof Error ? error.message : 'Failed to load users');
        } finally {
            setIsLoading(false);
        }
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
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            case 'employee':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
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
                    <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-full">
                        <div className="flex items-center justify-center min-h-[400px]">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sidebar-primary mx-auto mb-4"></div>
                                <p className="text-sidebar-foreground/70 font-aeonik">Loading users...</p>
                            </div>
                        </div>
                    </main>
                </SidebarInset>
            </SidebarProvider>
        );
    }

    if (error) {
        return (
            <SidebarProvider>
                <Sidebar />
                <SidebarInset>
                    <Header />
                    <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-full">
                        <Alert variant="destructive" className="max-w-2xl">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    </main>
                </SidebarInset>
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
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h1 className="text-sidebar-foreground font-aeonik text-3xl font-medium mb-2">
                                    Users
                                </h1>
                                <p className="text-sidebar-foreground/70 font-aeonik text-sm">
                                    View and manage all users in the system
                                </p>
                            </div>
                        </div>

                        {users.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-sidebar-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <UsersIcon className="w-8 h-8 text-sidebar-accent" />
                                </div>
                                <h3 className="text-sidebar-foreground font-aeonik text-lg font-medium mb-2">
                                    No users found
                                </h3>
                                <p className="text-sidebar-foreground/70 font-aeonik text-sm">
                                    There are no users registered in the system yet.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 max-w-full">
                                {users.map((user) => (
                                    <Card
                                        key={user.id}
                                        className="bg-card border-border hover:shadow-lg transition-shadow cursor-pointer max-w-sm"
                                        onClick={() => navigate(`/profile/${user.id}`)}
                                    >
                                        <CardHeader className="pb-4">
                                            <div className="flex items-center gap-4">
                                                <Avatar className="h-12 w-12">
                                                    <AvatarImage src={user.avatar_url} alt={user.name} />
                                                    <AvatarFallback className="bg-gradient-to-br from-orange-400 to-orange-600 text-white font-aeonik font-medium">
                                                        {getInitials(user.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <CardTitle className="text-sidebar-foreground font-aeonik text-lg font-medium mb-1 line-clamp-1">
                                                        {user.name}
                                                    </CardTitle>
                                                    <Badge className={`${getRoleColor(user.role)} border-0 text-xs`}>
                                                        {formatRole(user.role)}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </CardHeader>

                                        <CardContent className="pt-0 space-y-3">
                                            <div className="flex items-center text-sidebar-foreground/70">
                                                <Mail className="w-4 h-4 mr-3 flex-shrink-0" />
                                                <span className="font-aeonik text-sm truncate">{user.email}</span>
                                            </div>

                                            {user.phone && (
                                                <div className="flex items-center text-sidebar-foreground/70">
                                                    <Phone className="w-4 h-4 mr-3 flex-shrink-0" />
                                                    <span className="font-aeonik text-sm">{user.phone}</span>
                                                </div>
                                            )}

                                            {user.department && (
                                                <div className="flex items-center text-sidebar-foreground/70">
                                                    <Building className="w-4 h-4 mr-3 flex-shrink-0" />
                                                    <span className="font-aeonik text-sm">{user.department}</span>
                                                </div>
                                            )}

                                            {user.bio && (
                                                <div className="mt-3">
                                                    <p className="text-sidebar-foreground/70 font-aeonik text-sm line-clamp-2">
                                                        {user.bio}
                                                    </p>
                                                </div>
                                            )}

                                            <div className="flex items-center text-sidebar-foreground/60 pt-2 border-t border-border">
                                                <Calendar className="w-3 h-3 mr-2" />
                                                <span className="font-aeonik text-xs">
                                                    Joined {formatDate(user.created_at)}
                                                </span>
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