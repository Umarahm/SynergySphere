import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { type TimeLog, TimeLogResponse } from '@shared/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Clock, User, Monitor, Calendar, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

export default function TimeLog() {
    const { user, token } = useAuth();
    const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'user' | 'all'>('user');

    const isProjectManager = user?.role === 'project_manager';

    const fetchTimeLogs = async (mode: 'user' | 'all') => {
        try {
            setLoading(true);
            setError(null);

            const endpoint = mode === 'user' ? '/api/timelog/user' : '/api/timelog/all';
            const response = await fetch(endpoint, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch time logs');
            }

            const data: TimeLogResponse = await response.json();

            if (data.success && data.logs) {
                setTimeLogs(data.logs);
            } else {
                throw new Error(data.message);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTimeLogs(viewMode);
    }, [viewMode, token]);

    const handleRefresh = () => {
        fetchTimeLogs(viewMode);
    };

    const handleViewModeChange = (mode: 'user' | 'all') => {
        setViewMode(mode);
    };

    const formatUserAgent = (userAgent?: string) => {
        if (!userAgent) return 'Unknown';

        // Extract browser and OS info
        const browserMatch = userAgent.match(/(Chrome|Firefox|Safari|Edge|Opera)\/[\d.]+/);
        const osMatch = userAgent.match(/(Windows|Mac|Linux|Android|iOS)/);

        const browser = browserMatch ? browserMatch[1] : 'Unknown Browser';
        const os = osMatch ? osMatch[1] : 'Unknown OS';

        return `${browser} on ${os}`;
    };

    const getTimeAgo = (date: Date) => {
        const now = new Date();
        const diffInMs = now.getTime() - new Date(date).getTime();
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        const diffInDays = Math.floor(diffInHours / 24);

        if (diffInDays > 0) {
            return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
        } else if (diffInHours > 0) {
            return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
        } else {
            const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
            return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
        }
    };

    return (
        <SidebarProvider defaultOpen={true}>
            <div className="min-h-screen bg-dashboard-bg flex w-full">
                {/* Sidebar */}
                <Sidebar />

                {/* Main Content */}
                <SidebarInset className="flex-1">
                    <div className="p-6">
                        <div className="max-w-7xl mx-auto space-y-6">
                            {/* Header */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Clock className="w-8 h-8 text-primary" />
                                    <div>
                                        <h1 className="text-3xl font-bold">Time Log</h1>
                                        <p className="text-muted-foreground">
                                            {viewMode === 'user'
                                                ? 'Track your login history and sessions'
                                                : 'Monitor all user login activities'
                                            }
                                        </p>
                                    </div>
                                </div>
                                <Button onClick={handleRefresh} variant="outline" size="sm">
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Refresh
                                </Button>
                            </div>

                            {/* View Mode Toggle */}
                            {isProjectManager && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">View Options</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex gap-2">
                                            <Button
                                                variant={viewMode === 'user' ? 'default' : 'outline'}
                                                onClick={() => handleViewModeChange('user')}
                                            >
                                                <User className="w-4 h-4 mr-2" />
                                                My Logs
                                            </Button>
                                            <Button
                                                variant={viewMode === 'all' ? 'default' : 'outline'}
                                                onClick={() => handleViewModeChange('all')}
                                            >
                                                <Monitor className="w-4 h-4 mr-2" />
                                                All User Logs
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Statistics */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Total Logins</CardTitle>
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{timeLogs.length}</div>
                                        <p className="text-xs text-muted-foreground">
                                            {viewMode === 'user' ? 'Your login sessions' : 'All user sessions'}
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">This Week</CardTitle>
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            {timeLogs.filter(log => {
                                                const logDate = new Date(log.login_timestamp);
                                                const weekAgo = new Date();
                                                weekAgo.setDate(weekAgo.getDate() - 7);
                                                return logDate >= weekAgo;
                                            }).length}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Logins in the last 7 days
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Last Login</CardTitle>
                                        <User className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            {timeLogs.length > 0 ? getTimeAgo(timeLogs[0].login_timestamp) : 'Never'}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Most recent session
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Time Logs Table */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Login History</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {loading ? (
                                        <div className="flex items-center justify-center py-8">
                                            <RefreshCw className="w-6 h-6 animate-spin" />
                                            <span className="ml-2">Loading time logs...</span>
                                        </div>
                                    ) : error ? (
                                        <div className="flex items-center justify-center py-8 text-destructive">
                                            <span>{error}</span>
                                        </div>
                                    ) : timeLogs.length === 0 ? (
                                        <div className="flex items-center justify-center py-8 text-muted-foreground">
                                            <span>No login records found</span>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        {viewMode === 'all' && <TableHead>User</TableHead>}
                                                        <TableHead>Login Time</TableHead>
                                                        <TableHead>Time Ago</TableHead>
                                                        <TableHead>Browser/Device</TableHead>
                                                        <TableHead>IP Address</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {timeLogs.map((log) => (
                                                        <TableRow key={log.id}>
                                                            {viewMode === 'all' && (
                                                                <TableCell>
                                                                    <div className="flex flex-col">
                                                                        <span className="font-medium">{log.user_name}</span>
                                                                        <span className="text-sm text-muted-foreground">{log.user_email}</span>
                                                                    </div>
                                                                </TableCell>
                                                            )}
                                                            <TableCell>
                                                                <div className="flex flex-col">
                                                                    <span className="font-medium">
                                                                        {format(new Date(log.login_timestamp), 'MMM dd, yyyy')}
                                                                    </span>
                                                                    <span className="text-sm text-muted-foreground">
                                                                        {format(new Date(log.login_timestamp), 'hh:mm:ss a')}
                                                                    </span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge variant="secondary">
                                                                    {getTimeAgo(log.login_timestamp)}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>
                                                                <span className="text-sm">
                                                                    {formatUserAgent(log.user_agent)}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell>
                                                                <code className="text-sm bg-muted px-1 py-0.5 rounded">
                                                                    {log.ip_address || 'Unknown'}
                                                                </code>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
}