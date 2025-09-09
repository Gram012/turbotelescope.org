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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { InviteMemberModal } from "@/components/invite-member-modal";
import { AuthGuard } from "@/components/auth-guard";
import { GitHubIssues } from "@/components/github-issues";
import {
  Bell,
  Search,
  Check,
  X as XIcon,
  BarChart,
  Telescope,
  MoreHorizontal,
} from "lucide-react";

type DashboardContentProps = {
  owner?: string;
  repo?: string;
  showWazAlerts?: boolean;
  impersonationControls?: ReactNode;
  /** If true, DO NOT wrap with AuthGuard (useful on /admin, already gated server-side) */
  disableAuthGuard?: boolean;
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
  showWazAlerts = true,
  impersonationControls,
  disableAuthGuard = false,
}: DashboardContentProps) {
  const { data: session } = useSession();
  const user = session?.user;

  const stats = [
    {
      title: "Succes Rate",
      value: "95%",
      change: "+12.5% from last week",
      icon: Check,
      color: "text-green-600",
    },
    {
      title: "Failure Rate",
      value: "5%",
      change: "-12.5% from last week",
      icon: XIcon,
      color: "text-red-600",
    },
    {
      title: "Most Problematic Step",
      value: "Assign Ref",
      change: "10 failures",
      icon: BarChart,
      color: "text-purple-600",
    },
    {
      title: "Images Processed",
      value: "312",
      change: "",
      icon: Telescope,
      color: "text-blue-600",
    },
  ];

  const recentWaz = [
    {
      name: "file transfer init from Yaai",
      email: "6/4 10:10",
      role: "Admin",
      status: "Task",
    },
    {
      name: "drives spinning up",
      email: "6/4 2:43",
      role: "Editor",
      status: "Task",
    },
    {
      name: "drives spinning down",
      email: "6/3 21:46",
      role: "Viewer",
      status: "Task",
    },
    {
      name: "drive /dev/04 at 60 C",
      email: "6/3 21:45",
      role: "Editor",
      status: "WARNING",
    },
  ];

  const recentPtype = [
    {
      name: "Opening Enclosure",
      email: "",
      role: "Admin",
      status: "6/2 - 21:16",
    },
    {
      name: "Closing Ensclosure",
      email: "",
      role: "Editor",
      status: "6/2 - 17:37",
    },
    {
      name: "Night: False",
      email: "No Clouds: True, Low Wind: True, No Rain: True",
      role: "Viewer",
      status: "6/2 - 17:37",
    },
    {
      name: "TurboSitter",
      email: "Bad observing conditions and enclosure still open",
      role: "Editor",
      status: "6/2 - 17:37",
    },
  ];

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

          {/* Main Content */}
          <main className="flex-1 space-y-4 p-4 md:p-6">
            {/* Welcome */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">
                Welcome back, {user?.name || "User"}
              </h2>
              <p className="text-slate-600">
                Here's what's happening.
                {user?.email && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {user.email}
                  </span>
                )}
              </p>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <Card key={index} className="border-slate-200">
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

            {/* Content Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left: Activity + Issues */}
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
                      {[
                        {
                          action: "xxx",
                          user: "LW runtime",
                          time: "6/4 - 21:45",
                        },
                        {
                          action: "xxx",
                          user: "TurboDocker",
                          time: "6/4 - 12:32",
                        },
                        {
                          action: "xxx",
                          user: "LW runtime",
                          time: "6/2 - 15:17",
                        },
                        {
                          action: "xxx",
                          user: "TurboDocker",
                          time: "5/30 - 9:51",
                        },
                      ].map((activity, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-4 p-3 rounded-lg hover:bg-slate-50"
                        >
                          <div className="w-2 h-2 bg-blue-600 rounded-full" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900">
                              {activity.action}
                            </p>
                            <p className="text-xs text-slate-500">
                              {activity.user} • {activity.time}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <GitHubIssues owner={owner} repo={repo} />
              </div>

              {/* Right: Alerts */}
              <div className="space-y-6">
                {showWazAlerts && (
                  <Card className="border-slate-200">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>WAZ Alerts</CardTitle>
                        </div>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {recentWaz.map((u, idx) => (
                          <div
                            key={idx}
                            className="flex items-center space-x-3"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900 truncate">
                                {u.name}
                              </p>
                              <p className="text-xs text-slate-500 truncate">
                                {u.email}
                              </p>
                            </div>
                            <Badge
                              variant={
                                u.status === "Active" ? "default" : "secondary"
                              }
                              className="text-xs"
                            >
                              {u.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4">
                        <InviteMemberModal
                          trigger={
                            <Button variant="outline" className="w-full">
                              See More Alerts
                            </Button>
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card className="border-slate-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Prototype Alerts</CardTitle>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        {
                          name: "Opening Enclosure",
                          email: "",
                          status: "6/2 - 21:16",
                        },
                        {
                          name: "Closing Ensclosure",
                          email: "",
                          status: "6/2 - 17:37",
                        },
                        {
                          name: "Night: False",
                          email:
                            "No Clouds: True, Low Wind: True, No Rain: True",
                          status: "6/2 - 17:37",
                        },
                        {
                          name: "TurboSitter",
                          email:
                            "Bad observing conditions and enclosure still open",
                          status: "6/2 - 17:37",
                        },
                      ].map((u, idx) => (
                        <div key={idx} className="flex items-center space-x-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">
                              {u.name}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                              {u.email}
                            </p>
                          </div>
                          <Badge className="text-xs">{u.status}</Badge>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4">
                      <Button variant="outline" className="w-full">
                        See More Alerts
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </MaybeGuard>
  );
}
