"use client";

import { useSession } from "next-auth/react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AuthGuard } from "@/components/auth-guard";
import { GitHubIssues } from "@/components/github-issues";
import { Bell, Search, Check, X as XIcon, Telescope } from "lucide-react";

type Row = {
  image_id: number;
  file_path: string;
  status: string;
  processing_time: number | null;
  pipeline_step: string;
  step_message: string | null;
  time_of_run: string;
};

type KPI = {
  success: number;
  failure: number;
  total: number;
};

type DashboardContentProps = {
  owner?: string;
  repo?: string;
  showWazAlerts?: boolean; // you can hide/remove if not needed
  impersonationControls?: ReactNode;
  disableAuthGuard?: boolean;

  // ✅ passed in from the server page
  successOrFail: KPI;
  tableData: Row[];
};

function MaybeGuard({
  disabled,
  children,
}: {
  disabled?: boolean;
  children: ReactNode;
}) {
  return disabled ? <>{children}</> : <AuthGuard>{children}</AuthGuard>;
}

export function DashboardContent({
  owner = "patkel",
  repo = "turbo_telescope",
  showWazAlerts = false,
  impersonationControls,
  disableAuthGuard = false,
  successOrFail,
  tableData,
}: DashboardContentProps) {
  const { data: session } = useSession();
  const user = session?.user;

  // Safe defaults so UI never crashes
  const kpi = successOrFail ?? { success: 0, failure: 0, total: 0 };
  const total = Math.max(kpi.total, 1);

  const stats = [
    {
      title: "Success Rate",
      value: `${((kpi.success / total) * 100).toFixed(1)}%`,
      change: ``,
      icon: Check,
      color: "text-green-600",
    },
    {
      title: "Failure Rate",
      value: `${((kpi.failure / total) * 100).toFixed(1)}%`,
      change: ``,
      icon: XIcon,
      color: "text-red-600",
    },
    {
      title: "Images Processed",
      value: `${kpi.total}`,
      change: ``,
      icon: Telescope,
      color: "text-blue-600",
    },
  ];

  // derive image_name from file_path
  const recentItems = (tableData ?? []).slice(0, 20).map((r) => {
    const base = r.file_path ?? "";
    const slash = base.lastIndexOf("/") + 1;
    const dot = base.toLowerCase().lastIndexOf(".fits");
    const image_name =
      slash > 0 && dot > slash ? base.substring(slash, dot) : base || "unknown";
    return {
      id: r.image_id,
      image_name,
      step: r.pipeline_step,
      time: r.time_of_run,
    };
  });

  return (
    <MaybeGuard disabled={disableAuthGuard}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          {/* Header */}
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex items-center justify-between w-full">
              <h1 className="text-lg font-semibold">Dashboard Overview</h1>
              <div className="flex items-center space-x-4">
                <div className="relative hidden md:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search..."
                    className="pl-10 w-64 border-slate-300"
                  />
                </div>
                {impersonationControls}
                <Button variant="ghost" size="sm">
                  <Bell className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </header>

          {/* Main */}
          <main className="flex-1 space-y-4 p-4 md:p-6">
            {/* Welcome */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">
                Welcome back, {user?.name || "User"}
              </h2>
              <p className="text-slate-600">
                Here’s what’s happening.
                {user?.email && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {user.email}
                  </span>
                )}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {stats.map((stat, i) => (
                <Card key={i} className="border-slate-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600 mb-1">
                          {stat.title}
                        </p>
                        <p className="text-2xl font-bold text-slate-900">
                          {stat.value}
                        </p>
                        {stat.change && (
                          <p className="text-sm text-green-600 font-medium">
                            {stat.change}
                          </p>
                        )}
                      </div>
                      <div
                        className={`p-3 rounded-lg bg-slate-100 ${stat.color}`}
                      >
                        <stat.icon className="w-6 h-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Pipeline Runs */}
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-slate-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Recent Pipeline Runs</CardTitle>
                        <CardDescription>
                          Latest pipeline runs with database entries
                        </CardDescription>
                      </div>
                      <Button variant="outline" size="sm">
                        View All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center space-x-4 p-3 rounded-lg hover:bg-slate-50"
                        >
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900">
                              {item.image_name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {item.step} • {item.time}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* GitHub Issues */}
                <GitHubIssues owner={owner} repo={repo} />
              </div>

              {/* (Optional) Right column content can go here */}
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </MaybeGuard>
  );
}
