import React from "react";
import { ChevronRight, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
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

export function ProjectBreadcrumb() {
    const location = useLocation();
    const pathname = location.pathname;

    // Generate breadcrumb segments based on current path
    const getBreadcrumbSegments = (): BreadcrumbSegment[] => {
        const segments: BreadcrumbSegment[] = [
            { label: "Dashboard", href: "/dashboard" }
        ];

        if (pathname.startsWith("/projects")) {
            segments.push({ label: "Projects", href: "/projects" });

            if (pathname === "/projects/new") {
                segments.push({ label: "New Project", isActive: true });
            } else if (pathname.match(/^\/projects\/[^/]+$/)) {
                // Individual project page like /projects/abc123
                segments.push({ label: "Project Details", isActive: true });
            } else if (pathname === "/projects") {
                segments[segments.length - 1].isActive = true;
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