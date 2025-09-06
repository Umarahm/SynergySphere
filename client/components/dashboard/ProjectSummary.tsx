import React, { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Project as APIProject } from "@shared/api";

interface ProjectStatus {
  label: string;
  color: string;
  bgColor: string;
}

interface Project {
  id: string;
  name: string;
  manager: string;
  dueDate: string;
  status: ProjectStatus;
  progress: number;
  progressColor: string;
}

// Helper function to convert API project to display project
const convertAPIProject = (apiProject: APIProject): Project => {
  const daysUntilDeadline = Math.floor((new Date(apiProject.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  
  // Use the actual completion percentage from the database
  const progress = apiProject.completion_percentage || 0;
  
  let status: ProjectStatus;
  let progressColor: string;

  // Determine status based on completion and deadline
  if (progress >= 100) {
    // Project is completed
    status = {
      label: "Completed",
      color: "text-green-success",
      bgColor: "bg-green-success/18"
    };
    progressColor = "stroke-green-success fill-green-success";
  } else if (daysUntilDeadline < 0) {
    // Overdue
    status = {
      label: "Overdue",
      color: "text-red-danger",
      bgColor: "bg-red-danger/18"
    };
    progressColor = "stroke-red-danger fill-red-danger";
  } else if (daysUntilDeadline <= 7) {
    // Due soon
    status = {
      label: "Due soon",
      color: "text-yellow-warning",
      bgColor: "bg-yellow-warning/18"
    };
    progressColor = "stroke-yellow-warning fill-yellow-warning";
  } else if (daysUntilDeadline > 30) {
    // Just started or planned
    status = {
      label: "Planning",
      color: "text-blue-500",
      bgColor: "bg-blue-500/18"
    };
    progressColor = "stroke-blue-500 fill-blue-500";
  } else {
    // In progress
    status = {
      label: "In progress",
      color: "text-orange-primary",
      bgColor: "bg-orange-primary/18"
    };
    progressColor = "stroke-orange-primary fill-orange-primary";
  }

  return {
    id: apiProject.id,
    name: apiProject.name,
    manager: apiProject.project_manager_name || "Unknown",
    dueDate: new Date(apiProject.deadline).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    }),
    status,
    progress,
    progressColor
  };
};

function ProgressCircle({
  progress,
  color,
}: {
  progress: number;
  color: string;
}) {
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative w-8 h-8">
      <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 32 32">
        {/* Background circle */}
        <circle
          cx="16"
          cy="16"
          r={radius}
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          className="text-gray-200"
        />
        {/* Progress circle */}
        <circle
          cx="16"
          cy="16"
          r={radius}
          strokeWidth="2"
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={color}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-aeonik text-text-primary">
          {progress}%
        </span>
      </div>
    </div>
  );
}

export function ProjectSummary() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();

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
          // Convert API projects to display projects and limit to 5 for dashboard
          const displayProjects = (data.projects || [])
            .slice(0, 5)
            .map(convertAPIProject);
          setProjects(displayProjects);
        }
      }
    } catch (err) {
      console.error("Error fetching projects:", err);
      // Fall back to empty array on error
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="bg-card-bg rounded-2xl p-5 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-text-primary font-aeonik text-lg font-normal">
          Project summary
        </h3>

        {/* Filters - Responsive layout */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 overflow-x-auto">
          <div className="bg-white rounded-2xl px-3 lg:px-4 py-2 shadow-sm border border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-text-primary font-aeonik text-sm">
                Project
              </span>
              <ChevronDown className="w-4 h-4 text-gray-600" />
            </div>
          </div>

          <div className="bg-white rounded-2xl px-3 lg:px-4 py-2 shadow-sm border border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-text-primary font-aeonik text-sm hidden sm:inline">
                Project manager
              </span>
              <span className="text-text-primary font-aeonik text-sm sm:hidden">
                Manager
              </span>
              <ChevronDown className="w-4 h-4 text-gray-600" />
            </div>
          </div>

          <div className="bg-white rounded-2xl px-3 lg:px-4 py-2 shadow-sm border border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-text-primary font-aeonik text-sm">
                Status
              </span>
              <ChevronDown className="w-4 h-4 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Table - Responsive layout */}
      <div className="space-y-4">
        {/* Desktop Table Header - Hidden on mobile */}
        <div className="hidden lg:grid grid-cols-12 gap-4 pb-2 border-b border-black/10">
          <div className="col-span-3">
            <span className="text-text-primary font-aeonik text-sm font-medium">
              Name
            </span>
          </div>
          <div className="col-span-3">
            <span className="text-text-primary font-aeonik text-sm font-medium">
              Project manager
            </span>
          </div>
          <div className="col-span-2">
            <span className="text-text-primary font-aeonik text-sm font-medium">
              Due date
            </span>
          </div>
          <div className="col-span-2">
            <span className="text-text-primary font-aeonik text-sm font-medium">
              Status
            </span>
          </div>
          <div className="col-span-2">
            <span className="text-text-primary font-aeonik text-sm font-medium">
              Progress
            </span>
          </div>
        </div>

        {/* Responsive Table Rows */}
        {isLoading ? (
          // Loading skeleton
          [...Array(3)].map((_, index) => (
            <div key={index} className="lg:grid lg:grid-cols-12 lg:gap-4 lg:py-2 lg:items-center">
              <div className="lg:hidden bg-white/20 rounded-xl p-4 space-y-3 animate-pulse">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                  <div className="w-8 h-8 bg-muted rounded-full"></div>
                </div>
                <div className="h-6 bg-muted rounded w-20"></div>
              </div>
              <div className="hidden lg:contents">
                <div className="col-span-3"><div className="h-4 bg-muted rounded w-3/4"></div></div>
                <div className="col-span-3"><div className="h-4 bg-muted rounded w-1/2"></div></div>
                <div className="col-span-2"><div className="h-4 bg-muted rounded w-2/3"></div></div>
                <div className="col-span-2"><div className="h-6 bg-muted rounded w-16"></div></div>
                <div className="col-span-2"><div className="w-8 h-8 bg-muted rounded-full"></div></div>
              </div>
            </div>
          ))
        ) : projects.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-text-secondary font-aeonik text-sm">No projects found</p>
          </div>
        ) : (
          projects.map((project, index) => (
            <div
              key={project.id || index}
              className="lg:grid lg:grid-cols-12 lg:gap-4 lg:py-2 lg:items-center"
            >
              {/* Mobile Card Layout */}
              <div className="lg:hidden bg-white/20 rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-text-primary font-aeonik text-sm font-medium mb-1">
                      {project.name}
                    </h4>
                    <p className="text-text-secondary font-aeonik text-xs">
                      {project.manager} • {project.dueDate}
                    </p>
                  </div>
                  <ProgressCircle
                    progress={project.progress}
                    color={project.progressColor}
                  />
                </div>
                <div
                  className={`inline-flex px-2 py-1 rounded-2xl ${project.status.bgColor}`}
                >
                  <span className={`font-aeonik text-xs ${project.status.color}`}>
                    {project.status.label}
                  </span>
                </div>
              </div>

              {/* Desktop Grid Layout */}
              <div className="hidden lg:contents">
                <div className="col-span-3">
                  <span className="text-text-primary font-aeonik text-sm">
                    {project.name}
                  </span>
                </div>
                <div className="col-span-3">
                  <span className="text-text-primary font-aeonik text-sm">
                    {project.manager}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-text-primary font-aeonik text-sm">
                    {project.dueDate}
                  </span>
                </div>
                <div className="col-span-2">
                  <div
                    className={`inline-flex px-2 py-1 rounded-2xl ${project.status.bgColor}`}
                  >
                    <span
                      className={`font-aeonik text-xs ${project.status.color}`}
                    >
                      {project.status.label}
                    </span>
                  </div>
                </div>
                <div className="col-span-2">
                  <ProgressCircle
                    progress={project.progress}
                    color={project.progressColor}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
