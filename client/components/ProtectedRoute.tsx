import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
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

    if (!isAuthenticated) {
        // Redirect to login page but save the attempted location
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
}