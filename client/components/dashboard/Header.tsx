import React from "react";
import { ChevronDown, LogOut, User } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
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

  return (
    <div className="bg-transparent">
      {/* Header Content */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between px-4 sm:px-6 lg:px-8 py-4 lg:py-6 gap-4 lg:gap-0">
        {/* Mobile Menu & Title */}
        <div className="flex items-center gap-3 w-full lg:w-auto">
          {/* Mobile/Desktop Menu Button */}
          <SidebarTrigger className="bg-background rounded-full shadow-sm border border-border h-10 w-10 hover:bg-accent" />

          {/* Dashboard Title */}
          <h1 className="text-foreground font-aeonik text-2xl lg:text-3xl font-normal">
            Dashboard
          </h1>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2 lg:gap-4 w-auto">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <NotificationDropdown />

          {/* User Profile - Updated with auth data and dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="bg-background rounded-full pl-1 lg:pl-2 pr-2 lg:pr-5 py-1 lg:py-2 shadow-sm border border-border flex-shrink-0 hover:bg-accent transition-colors">
                <div className="flex items-center gap-1 lg:gap-3">
                  {/* Avatar */}
                  <div className="w-8 lg:w-10 h-8 lg:h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center">
                    <span className="text-white font-aeonik text-xs lg:text-sm font-medium">
                      {user ? getInitials(user.name) : 'U'}
                    </span>
                  </div>

                  {/* User Info - Hidden on mobile */}
                  <div className="hidden sm:flex flex-col">
                    <span className="text-foreground font-aeonik text-sm font-medium">
                      {user?.name || 'User'}
                    </span>
                    <span className="text-muted-foreground font-aeonik text-xs">
                      {user?.role || 'Member'}
                    </span>
                  </div>

                  {/* Dropdown Arrow */}
                  <ChevronDown className="w-3 lg:w-4 h-3 lg:h-4 text-muted-foreground" />
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-3 py-2">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-border mx-4 sm:mx-6 lg:mx-8"></div>
    </div>
  );
}
