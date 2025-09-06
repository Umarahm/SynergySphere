import React, { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Project } from "@shared/api";

interface ProgressStat {
  label: string;
  value: string;
  color: string;
}

// Function to calculate project statistics from real data
const calculateStats = (projects: Project[]) => {
  const total = projects.length;
  let completed = 0;
  let delayed = 0;
  let ongoing = 0;
  let totalCompletionPercentage = 0;

  projects.forEach(project => {
    const now = new Date();
    const deadline = new Date(project.deadline);
    const completionPercentage = project.completion_percentage || 0;
    
    // Add to total completion percentage for average calculation
    totalCompletionPercentage += completionPercentage;
    
    // Categorize projects based on completion percentage and deadline
    const daysUntilDeadline = Math.floor((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (completionPercentage >= 100) {
      completed++;
    } else if (daysUntilDeadline < 0) {
      // Overdue projects
      delayed++;
    } else {
      // Projects in progress
      ongoing++;
    }
  });

  // Calculate average completion percentage across all projects
  const averageCompletionPercentage = total > 0 ? Math.round(totalCompletionPercentage / total) : 0;

  return {
    total,
    completed,
    delayed,
    ongoing,
    completedPercentage: averageCompletionPercentage,
    progressStats: [
      { label: "Total projects", value: total.toString(), color: "text-text-primary" },
      { label: "Completed", value: completed.toString(), color: "text-green-success" },
      { label: "Delayed", value: delayed.toString(), color: "text-yellow-warning" },
      { label: "On going", value: ongoing.toString(), color: "text-orange-primary" },
    ]
  };
};

function CircularProgressChart({ progress, stats }: { progress: number; stats: any }) {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Calculate proportional segments for multi-colored progress based on real data
  const total = stats.total;
  const completedRatio = total > 0 ? stats.completed / total : 0;
  const delayedRatio = total > 0 ? stats.delayed / total : 0;
  const ongoingRatio = total > 0 ? stats.ongoing / total : 0;

  // Create segments based on completion percentage ranges
  const completedSegment = circumference * completedRatio;
  const delayedSegment = circumference * delayedRatio;
  const ongoingSegment = circumference * ongoingRatio;

  return (
    <div className="relative w-44 h-44 flex items-center justify-center">
      <svg className="w-44 h-44 transform -rotate-90" viewBox="0 0 200 200">
        {/* Background circle */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          stroke="#f3f4f6"
          strokeWidth="8"
          fill="none"
        />

        {/* Completed progress (green) */}
        {completedSegment > 0 && (
          <circle
            cx="100"
            cy="100"
            r={radius}
            stroke="#1A932E"
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${completedSegment} ${circumference - completedSegment}`}
            strokeDashoffset={0}
            strokeLinecap="round"
          />
        )}

        {/* Delayed progress (yellow) - starts after completed */}
        {delayedSegment > 0 && (
          <circle
            cx="100"
            cy="100"
            r={radius}
            stroke="#DFA510"
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${delayedSegment} ${circumference - delayedSegment}`}
            strokeDashoffset={-completedSegment}
            strokeLinecap="round"
          />
        )}

        {/* Ongoing progress (orange) - starts after completed and delayed */}
        {ongoingSegment > 0 && (
          <circle
            cx="100"
            cy="100"
            r={radius}
            stroke="#E65F2B"
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${ongoingSegment} ${circumference - ongoingSegment}`}
            strokeDashoffset={-(completedSegment + delayedSegment)}
            strokeLinecap="round"
          />
        )}
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-text-primary font-aeonik text-3xl font-normal">
            {progress}%
          </div>
          <div className="text-text-secondary font-aeonik text-sm">
            Average Progress
          </div>
        </div>
      </div>
    </div>
  );
}

export function OverallProgress() {
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
          setProjects(data.projects || []);
        }
      }
    } catch (err) {
      console.error("Error fetching projects:", err);
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = calculateStats(projects);
  return (
    <div className="bg-card-bg rounded-2xl p-5 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-8">
        {/* Header */}
        <div className="w-full flex items-center justify-between">
          <h3 className="text-text-primary font-aeonik text-lg font-normal">
            Overall Progress
          </h3>

          {/* Filter */}
          <div className="bg-white rounded-2xl px-4 py-2 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-text-primary font-aeonik text-sm">All</span>
              <ChevronDown className="w-4 h-4 text-gray-600" />
            </div>
          </div>
        </div>

        {/* Progress Chart */}
        <div className="flex flex-col items-center gap-8">
          {isLoading ? (
            <div className="w-44 h-44 bg-muted rounded-full animate-pulse flex items-center justify-center">
              <div className="text-muted-foreground font-aeonik text-sm">Loading...</div>
            </div>
          ) : (
            <CircularProgressChart progress={stats.completedPercentage} stats={stats} />
          )}

          {/* Progress Statistics */}
          <div className="w-full grid grid-cols-2 gap-4">
            {isLoading ? (
              [...Array(4)].map((_, index) => (
                <div key={index} className="flex flex-col items-center gap-1">
                  <div className="h-8 w-12 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 w-16 bg-muted rounded animate-pulse"></div>
                </div>
              ))
            ) : (
              stats.progressStats.map((stat, index) => (
                <div key={index} className="flex flex-col items-center gap-1">
                  <span className={`font-aeonik text-2xl font-normal ${stat.color}`}>
                    {stat.value}
                  </span>
                  <span className="text-text-secondary font-aeonik text-sm text-center">
                    {stat.label}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
