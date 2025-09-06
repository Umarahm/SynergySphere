import React from "react";
import {
  BarChart,
  Briefcase,
  CheckSquare,
  Clock,
  Users,
  User,
  MessageCircle,
  Plus,
  ChevronLeft,
  LogOut,
} from "lucide-react";
import {
  Sidebar as SidebarPrimitive,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";

const navigationItems = [
  { name: "Dashboard", icon: BarChart, path: "/dashboard", active: false },
  { name: "Projects", icon: Briefcase, path: "/projects", active: false },
  { name: "Tasks", icon: CheckSquare, path: "/tasks", active: false },
  { name: "Chatroom", icon: MessageCircle, path: "/chatroom", active: false },
  { name: "Profile", icon: User, path: "/profile", active: false },
  { name: "Time log", icon: Clock, path: "/time-log", active: false },
  { name: "Users", icon: Users, path: "/users", active: false },
];

export function Sidebar() {
  const { toggleSidebar, state } = useSidebar();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isCollapsed = state === "collapsed";

  // Determine active navigation item based on current path
  const getActiveNavItem = (path: string) => {
    if (location.pathname === "/dashboard" || location.pathname === "/") {
      return path === "/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  const handleCreateNewProject = () => {
    if (user?.role === "project_manager") {
      navigate("/projects/new");
    } else {
      // For employees, redirect to projects page
      navigate("/projects");
    }
  };

  // Get initials from user name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Filter navigation items based on user role
  const getFilteredNavigationItems = () => {
    return navigationItems.filter(item => {
      // Time log is only visible to project managers
      if (item.path === '/time-log') {
        return user?.role === 'project_manager';
      }
      return true;
    });
  };

  return (
    <SidebarPrimitive
      collapsible="icon"
      className="bg-sidebar border-sidebar-border dark:bg-sidebar [&_*::-webkit-scrollbar]:w-2 [&_*::-webkit-scrollbar-track]:bg-sidebar [&_*::-webkit-scrollbar-thumb]:bg-sidebar-border [&_*::-webkit-scrollbar-thumb]:rounded-full [&_*::-webkit-scrollbar-thumb:hover]:bg-sidebar-accent/30"
      style={{
        "--sidebar-width": "260px",
        "--sidebar-width-icon": "60px",
      } as React.CSSProperties}
    >
      <SidebarHeader className="p-8 pt-10">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-sidebar-primary rounded-full flex items-center justify-center flex-shrink-0">
            <div className="w-3 h-3 bg-sidebar-primary-foreground rounded-full"></div>
          </div>
          {!isCollapsed && (
            <span className="text-sidebar-foreground font-aeonik text-lg font-medium">
              Promage
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Create New Project Button */}
        {!isCollapsed && (
          <div className="px-8 mb-8">
            <button
              onClick={handleCreateNewProject}
              className="w-full bg-sidebar-primary rounded-3xl p-3 flex items-center gap-3 hover:bg-sidebar-primary/90 transition-colors"
            >
              <div className="bg-sidebar-primary-foreground rounded-full p-2">
                <Plus className="w-6 h-6 text-sidebar-primary" />
              </div>
              <span className="text-sidebar-primary-foreground font-aeonik text-sm">
                {user?.role === "project_manager" ? "Create new project" : "View projects"}
              </span>
            </button>
          </div>
        )}

        {/* Collapsed Create Button */}
        {isCollapsed && (
          <div className="px-2 mb-4">
            <button
              onClick={handleCreateNewProject}
              className="w-full bg-sidebar-primary rounded-full p-3 flex items-center justify-center hover:bg-sidebar-primary/90 transition-colors"
            >
              <Plus className="w-6 h-6 text-sidebar-primary-foreground" />
            </button>
          </div>
        )}

        {/* Navigation Items */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className={isCollapsed ? "px-2" : "px-8"}>
              {getFilteredNavigationItems().map((item, index) => (
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton
                    isActive={getActiveNavItem(item.path)}
                    onClick={() => navigate(item.path)}
                    className={`
                      rounded-3xl transition-colors h-12 cursor-pointer
                      ${getActiveNavItem(item.path)
                        ? "bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/90"
                        : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/20"
                      }
                      ${isCollapsed ? "justify-center" : "justify-start gap-4"}
                    `}
                    tooltip={isCollapsed ? item.name : undefined}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && (
                      <span className="font-aeonik text-sm">{item.name}</span>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* User Profile Footer */}
      <SidebarFooter className={isCollapsed ? "px-2 pb-4" : "px-8 pb-8"}>
        {!isCollapsed && user && (
          <div className="bg-sidebar-accent/20 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-aeonik text-sm font-medium">
                  {getInitials(user.name)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sidebar-foreground font-aeonik text-sm font-medium truncate">
                  {user.name}
                </p>
                <p className="text-sidebar-foreground/70 font-aeonik text-xs truncate">
                  {user.email}
                </p>
              </div>
            </div>
            <Button
              onClick={logout}
              variant="outline"
              size="sm"
              className="w-full bg-transparent border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent/30 rounded-xl h-8"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </Button>
          </div>
        )}

        {/* Collapsed user profile */}
        {isCollapsed && user && (
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
              <span className="text-white font-aeonik text-sm font-medium">
                {getInitials(user.name)}
              </span>
            </div>
            <Button
              onClick={logout}
              variant="outline"
              size="sm"
              className="w-10 h-8 p-0 bg-transparent border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent/30 rounded-lg"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        )}
      </SidebarFooter>

      {/* Collapse Button */}
      <div className="absolute right-[-15px] top-8">
        <button
          onClick={toggleSidebar}
          className="bg-sidebar-primary rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <ChevronLeft
            className={`w-4 h-4 text-sidebar-primary-foreground transition-transform duration-200 ${isCollapsed ? "rotate-180" : ""
              }`}
          />
        </button>
      </div>

      <SidebarRail />
    </SidebarPrimitive>
  );
}
