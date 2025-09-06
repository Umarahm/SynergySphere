import React, { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Task, DashboardData } from "@shared/api";

interface TaskStatus {
  label: string;
  color: string;
  bgColor: string;
}

interface TaskItem {
  task: Task;
  status: TaskStatus;
  completed: boolean;
}

// Map task status to display format
const getTaskStatusDisplay = (status: string): TaskStatus => {
  switch (status) {
    case 'approved':
      return {
        label: "Approved",
        color: "text-green-success",
        bgColor: "bg-green-success/18",
      };
    case 'completed':
      return {
        label: "Completed",
        color: "text-blue-info",
        bgColor: "bg-blue-info/18",
      };
    case 'in_progress':
      return {
        label: "In Progress",
        color: "text-orange-primary",
        bgColor: "bg-orange-primary/18",
      };
    case 'new_task':
    default:
      return {
        label: "New Task",
        color: "text-red-danger",
        bgColor: "bg-red-danger/18",
      };
  }
};

const taskCategories = [
  { name: "All", count: null, active: true },
  { name: "Important", count: null, active: false },
  { name: "Notes", count: null, active: false },
  { name: "Links", count: null, active: false },
];

function TaskItemComponent({ task }: { task: TaskItem }) {
  const isCompleted = task.task.status === 'completed' || task.task.status === 'approved';

  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-4">
        {/* Checkbox */}
        <div
          className={`
          w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer
          ${isCompleted
              ? "bg-orange-primary border-orange-primary"
              : "border-gray-400 bg-transparent hover:border-orange-primary"
            }
        `}
        >
          {isCompleted && (
            <Check className="w-3 h-3 text-white" strokeWidth={2} />
          )}
        </div>

        {/* Task Title and Info */}
        <div className="flex flex-col">
          <span
            className={`
            font-aeonik text-sm
            ${isCompleted ? "text-text-primary" : "text-text-primary"}
          `}
          >
            {task.task.name}
          </span>
          <div className="flex items-center gap-2 text-xs text-text-secondary">
            {task.task.assignee_name && (
              <span className="font-aeonik">
                Assigned to: {task.task.assignee_name}
              </span>
            )}
            {task.task.project_name && (
              <>
                {task.task.assignee_name && <span>•</span>}
                <span className="font-aeonik">
                  {task.task.project_name}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <div
        className={`inline-flex px-2 py-1 rounded-2xl ${task.status.bgColor}`}
      >
        <span className={`font-aeonik text-xs ${task.status.color}`}>
          {task.status.label}
        </span>
      </div>
    </div>
  );
}

export function TodayTasks() {
  const { user, token } = useAuth();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
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
          // Get recent tasks (today's tasks + some recent ones if needed)
          const recentTasks = data.data.tasks.today_tasks.length > 0
            ? data.data.tasks.today_tasks
            : data.data.tasks.recent_tasks.slice(0, 5);

          const taskItems: TaskItem[] = recentTasks.map(task => ({
            task,
            status: getTaskStatusDisplay(task.status),
            completed: task.status === 'completed' || task.status === 'approved'
          }));

          setTasks(taskItems);

          // Update categories with actual counts
          taskCategories[0] = { ...taskCategories[0], count: data.data.tasks.total };
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

  if (loading) {
    return (
      <div className="bg-card-bg rounded-2xl p-5 backdrop-blur-sm">
        <div className="text-text-primary font-aeonik text-lg font-normal mb-4">
          Today task
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="text-text-secondary">Loading tasks...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card-bg rounded-2xl p-5 backdrop-blur-sm">
        <div className="text-text-primary font-aeonik text-lg font-normal mb-4">
          Today task
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
      <div className="mb-6">
        <h3 className="text-text-primary font-aeonik text-lg font-normal mb-4">
          {user?.role === 'project_manager' ? 'Team Tasks' : 'My Tasks'}
        </h3>

        {/* Category Tabs */}
        <div className="flex items-center gap-8 border-b border-black/10 pb-2">
          {taskCategories.map((category, index) => (
            <div key={index} className="flex items-center gap-2">
              <span
                className={`
                font-aeonik text-sm cursor-pointer
                ${category.active
                    ? "text-text-primary border-b-2 border-blue-info pb-2"
                    : "text-text-primary hover:text-blue-info"
                  }
              `}
              >
                {category.name}
              </span>

              {category.count && (
                <div className="bg-blue-info/10 rounded-full px-2 py-1">
                  <span className="text-blue-info font-aeonik text-xs">
                    {category.count < 10
                      ? `0${category.count}`
                      : category.count}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-1">
        {tasks.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-text-secondary font-aeonik text-sm">
              {user?.role === 'project_manager'
                ? 'No tasks assigned to team members'
                : 'No tasks assigned to you'}
            </div>
          </div>
        ) : (
          tasks.map((task, index) => (
            <TaskItemComponent key={`${task.task.id}-${index}`} task={task} />
          ))
        )}
      </div>
    </div>
  );
}
