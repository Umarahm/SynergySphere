import React, { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { DashboardData, ProjectWorkload } from "@shared/api";

interface WorkloadCell {
  project: ProjectWorkload | null;
  index: number;
}

// Create a grid representing the project workload
function createWorkloadGrid(projects: ProjectWorkload[]) {
  const grid = [];
  const itemsPerRow = 7;
  const totalRows = Math.ceil(Math.max(projects.length, 7) / itemsPerRow);

  for (let row = 0; row < totalRows; row++) {
    const gridRow = [];
    for (let col = 0; col < itemsPerRow; col++) {
      const projectIndex = row * itemsPerRow + col;
      if (projectIndex < projects.length) {
        gridRow.push(projects[projectIndex]);
      } else {
        gridRow.push(null);
      }
    }
    grid.push(gridRow);
  }
  return grid;
}

function WorkloadCellComponent({
  project,
  row,
  col,
}: {
  project: ProjectWorkload | null;
  row: number;
  col: number;
}) {
  if (!project) {
    return <div className="w-6 lg:w-8 h-6 lg:h-8"></div>;
  }

  const isHighWorkload = project.total_tasks >= 8;
  const isLowWorkload = project.total_tasks <= 2;
  const progressPercentage = project.progress_percentage;

  let cellClass =
    "w-6 lg:w-8 h-6 lg:h-8 rounded-full border-2 flex items-center justify-center text-xs font-aeonik font-medium cursor-pointer transition-all hover:scale-110";

  // Color based on workload intensity
  if (isHighWorkload) {
    cellClass += " bg-orange-primary border-orange-primary text-white";
  } else if (isLowWorkload) {
    cellClass += " border-text-primary/60 text-text-primary bg-transparent";
  } else {
    cellClass += " bg-text-primary border-text-primary text-white";
  }

  const displayValue = project.total_tasks < 10 ? `0${project.total_tasks}` : project.total_tasks.toString();
  const shortName = project.project_name.length > 8
    ? project.project_name.substring(0, 8) + "..."
    : project.project_name;

  return (
    <div className="flex flex-col items-center gap-1" title={`${project.project_name}: ${project.total_tasks} tasks (${progressPercentage}% complete)`}>
      <div className={cellClass}>
        <span className="text-xs lg:text-xs">
          {displayValue}
        </span>
      </div>
      <span className="text-text-secondary font-aeonik text-xs hidden sm:block text-center">
        {shortName}
      </span>
      <span className="text-text-secondary font-aeonik text-xs sm:hidden">
        {project.project_name.slice(0, 3)}
      </span>
      {/* Progress indicator */}
      <div className="flex items-center gap-1">
        <div className="text-xs text-text-secondary font-medium">
          {progressPercentage}%
        </div>
        <div className="w-8 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-green-success transition-all duration-300"
            style={{ width: `${Math.min(100, progressPercentage)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export function ProjectsWorkload() {
  const { user, token } = useAuth();
  const [projects, setProjects] = useState<ProjectWorkload[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user || !token) return;

      try {
        setLoading(true);
        const response = await fetch('/api/tasks/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const data: DashboardData = await response.json();

        if (data.success && data.data) {
          setProjects(data.data.projects.workload);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, token]);

  const workloadGrid = createWorkloadGrid(projects);

  if (loading) {
    return (
      <div className="bg-card-bg rounded-2xl p-5 backdrop-blur-sm">
        <div className="text-text-primary font-aeonik text-lg font-normal mb-4">
          Projects Workload
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="text-text-secondary">Loading workload data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card-bg rounded-2xl p-5 backdrop-blur-sm">
        <div className="text-text-primary font-aeonik text-lg font-normal mb-4">
          Projects Workload
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="text-red-danger">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card-bg rounded-2xl p-5 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-text-primary font-aeonik text-lg font-normal">
          Projects Workload
        </h3>

        {/* Time Filter */}
        <div className="bg-white rounded-2xl px-4 py-2 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <span className="text-text-primary font-aeonik text-sm">
              Current Projects
            </span>
            <ChevronDown className="w-4 h-4 text-gray-600" />
          </div>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-text-secondary font-aeonik text-sm">
            {user?.role === 'project_manager'
              ? 'No projects found'
              : 'No projects assigned'}
          </div>
        </div>
      ) : (
        <>
          {/* Workload Grid - Responsive */}
          <div className="space-y-3 lg:space-y-4">
            {workloadGrid.map((row, rowIndex) => (
              <div
                key={rowIndex}
                className="flex justify-between items-center gap-1 lg:gap-2"
              >
                {row.map((project, colIndex) => (
                  <WorkloadCellComponent
                    key={`${rowIndex}-${colIndex}`}
                    project={project}
                    row={rowIndex}
                    col={colIndex}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-6 flex items-center justify-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-text-primary"></div>
              <span className="text-text-secondary font-aeonik">Regular Load (3-7 tasks)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-primary"></div>
              <span className="text-text-secondary font-aeonik">High Load (8+ tasks)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border-2 border-text-primary/60"></div>
              <span className="text-text-secondary font-aeonik">Light Load (0-2 tasks)</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
