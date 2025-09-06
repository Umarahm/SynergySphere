import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@shared/api';

interface RoleBasedRouteProps {
    children: React.ReactNode;
    allowedRoles: UserRole[];
    redirectTo?: string;
    fallbackComponent?: React.ComponentType;
}

export function RoleBasedRoute({
    children,
    allowedRoles,
    redirectTo = "/dashboard",
    fallbackComponent: FallbackComponent
}: RoleBasedRouteProps) {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const hasRequiredRole = user.role && allowedRoles.includes(user.role);

    if (!hasRequiredRole) {
        if (FallbackComponent) {
            return <FallbackComponent />;
        }
        return <Navigate to={redirectTo} replace />;
    }

    return <>{children}</>;
}

// Higher-order component for project manager only routes
export function ProjectManagerRoute({ children }: { children: React.ReactNode }) {
    return (
        <RoleBasedRoute allowedRoles={['project_manager']} redirectTo="/projects">
            {children}
        </RoleBasedRoute>
    );
}

// Higher-order component for employee accessible routes
export function EmployeeRoute({ children }: { children: React.ReactNode }) {
    return (
        <RoleBasedRoute allowedRoles={['employee', 'project_manager']}>
            {children}
        </RoleBasedRoute>
    );
}