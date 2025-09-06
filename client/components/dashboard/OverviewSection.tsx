import React from "react";
import {
  BarChart3,
  Briefcase,
  Clock,
  User,
  ArrowUp,
  ArrowDown,
  ChevronDown,
} from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  subValue?: string;
  icon: React.ReactNode;
  iconBg: string;
  trend: "up" | "down";
  trendValue: string;
  trendText: string;
}

function MetricCard({
  title,
  value,
  subValue,
  icon,
  iconBg,
  trend,
  trendValue,
  trendText,
}: MetricCardProps) {
  return (
    <div className="bg-card-bg rounded-2xl p-5 backdrop-blur-sm">
      <div className="flex flex-col gap-5">
        {/* Icon */}
        <div
          className={`w-12 h-12 ${iconBg} rounded-full flex items-center justify-center`}
        >
          {icon}
        </div>

        {/* Content */}
        <div className="flex flex-col gap-2">
          <span className="text-text-secondary font-aeonik text-sm">
            {title}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-text-primary font-aeonik text-3xl font-normal">
              {value}
            </span>
            {subValue && (
              <span className="text-text-primary font-aeonik text-lg">
                {subValue}
              </span>
            )}
          </div>
        </div>

        {/* Trend */}
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-1">
            {trend === "up" ? (
              <ArrowUp className="w-3 h-3 text-green-success" />
            ) : (
              <ArrowDown className="w-3 h-3 text-red-danger" />
            )}
          </div>
          <span className="text-text-primary font-aeonik text-xs">
            {trendValue} {trendText}
          </span>
        </div>
      </div>
    </div>
  );
}

export function OverviewSection() {
  return (
    <div className="mt-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-text-primary font-aeonik text-2xl font-normal">
          Overview
        </h2>

        {/* Time Filter */}
        <div className="bg-white rounded-2xl px-4 py-2 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <span className="text-text-primary font-aeonik text-sm">
              Last 30 days
            </span>
            <ChevronDown className="w-4 h-4 text-gray-600" />
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard
          title="Total revenue"
          value="$53,00989"
          icon={<BarChart3 className="w-6 h-6 text-white" />}
          iconBg="bg-purple-metric"
          trend="up"
          trendValue="12%"
          trendText="increase from last month"
        />

        <MetricCard
          title="Projects"
          value="95"
          subValue="/100"
          icon={<Briefcase className="w-6 h-6 text-white" />}
          iconBg="bg-orange-metric"
          trend="down"
          trendValue="10%"
          trendText="decrease from last month"
        />

        <MetricCard
          title="Time spent"
          value="1022"
          subValue="/1300 Hrs"
          icon={<Clock className="w-6 h-6 text-white" />}
          iconBg="bg-blue-metric"
          trend="up"
          trendValue="8%"
          trendText="increase from last month"
        />

        <MetricCard
          title="Resources"
          value="101"
          subValue="/120"
          icon={<User className="w-6 h-6 text-white" />}
          iconBg="bg-yellow-metric"
          trend="up"
          trendValue="2%"
          trendText="increase from last month"
        />
      </div>
    </div>
  );
}
