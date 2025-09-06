import React from "react";
import { Sidebar } from "../components/dashboard/Sidebar";
import { Header } from "../components/dashboard/Header";
import { OverviewSection } from "../components/dashboard/OverviewSection";
import { ProjectSummary } from "../components/dashboard/ProjectSummary";
import { OverallProgress } from "../components/dashboard/OverallProgress";
import { TodayTasks } from "../components/dashboard/TodayTasks";
import { ProjectsWorkload } from "../components/dashboard/ProjectsWorkload";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default function Index() {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen bg-background flex w-full">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <SidebarInset className="flex-1">
          {/* Header */}
          <Header />

          {/* Content Area */}
          <div className="px-4 sm:px-6 lg:px-8 pb-8 bg-background">
            {/* Overview Section */}
            <OverviewSection />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mt-6">
              {/* Project Summary - Takes 2 columns on desktop, full width on mobile */}
              <div className="lg:col-span-2">
                <ProjectSummary />
              </div>

              {/* Overall Progress - Takes 1 column on desktop, full width on mobile */}
              <div className="lg:col-span-1">
                <OverallProgress />
              </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mt-6">
              {/* Today Tasks - Takes 2 columns on desktop, full width on mobile */}
              <div className="lg:col-span-2">
                <TodayTasks />
              </div>

              {/* Projects Workload - Takes 1 column on desktop, full width on mobile */}
              <div className="lg:col-span-1">
                <ProjectsWorkload />
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
