import React from "react";
import { ChevronRight } from "lucide-react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface BreadcrumbSegment {
    label: string;
    href?: string;
    isActive?: boolean;
}

export function TaskBreadcrumb() {
    const location = useLocation();
    const params = useParams();
    const pathname = location.pathname;

    // Generate breadcrumb segments based on current path
    const getBreadcrumbSegments = (): BreadcrumbSegment[] => {
        const segments: BreadcrumbSegment[] = [
            { label: "Dashboard", href: "/dashboard" }
        ];

        if (pathname.startsWith("/tasks")) {
            segments.push({ label: "Tasks", href: "/tasks" });

            if (pathname === "/tasks/new") {
                segments.push({ label: "Create Task", isActive: true });
            } else if (pathname.match(/^\/tasks\/[^/]+$/)) {
                // Individual task page like /tasks/abc123
                segments.push({ label: "Task Details", isActive: true });
            } else if (pathname === "/tasks") {
                segments[segments.length - 1].isActive = true;
            }
        } else if (pathname.startsWith("/projects") && pathname.includes("/tasks")) {
            // Handle project-specific task creation: /projects/:projectId/tasks/new
            segments.push({ label: "Projects", href: "/projects" });
            
            if (params.projectId) {
                segments.push({ 
                    label: "Project Details", 
                    href: `/projects/${params.projectId}` 
                });
            }
            
            if (pathname.endsWith("/tasks/new")) {
                segments.push({ label: "Create Task", isActive: true });
            }
        }

        return segments;
    };

    const segments = getBreadcrumbSegments();

    return (
        <Breadcrumb className="mb-6">
            <BreadcrumbList>
                {segments.map((segment, index) => (
                    <React.Fragment key={index}>
                        <BreadcrumbItem>
                            {segment.isActive ? (
                                <BreadcrumbPage className="text-sidebar-foreground font-aeonik text-sm font-medium">
                                    {segment.label}
                                </BreadcrumbPage>
                            ) : (
                                <BreadcrumbLink
                                    asChild
                                    className="text-sidebar-foreground/70 hover:text-sidebar-foreground font-aeonik text-sm transition-colors"
                                >
                                    <Link to={segment.href!}>{segment.label}</Link>
                                </BreadcrumbLink>
                            )}
                        </BreadcrumbItem>
                        {index < segments.length - 1 && (
                            <BreadcrumbSeparator>
                                <ChevronRight className="w-4 h-4 text-sidebar-foreground/50" />
                            </BreadcrumbSeparator>
                        )}
                    </React.Fragment>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    );
}