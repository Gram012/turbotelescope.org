"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BarChart3,
  Users,
  Settings,
  KeyIcon,
  Shell,
  HardDrive,
  ChevronUp,
  LogOut,
  LayoutDashboard,
  ScanEye,
} from "lucide-react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useMemo } from "react";

type NavItem = { title: string; url: string; icon: any; external?: boolean };

const navigationItems: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  {
    title: "Image Health Website",
    url: "https://wicapi.spa.umn.edu/ihw/",
    icon: BarChart3,
    external: true,
  },
  { title: "Team Members", url: "/dashboard/users", icon: Users },
  {
    title: "WAZ",
    url: "https://spa-u-waziyata.spa.umn.edu/login",
    icon: HardDrive,
    external: true,
  },
  {
    title: "BitWarden",
    url: "https://vault.bitwarden.com/#/vault",
    icon: KeyIcon,
    external: true,
  },
  {
    title: "SkyPortal",
    url: "https://wicapi.spa.umn.edu",
    icon: Shell,
    external: true,
  },
  { title: "Turbositter", url: "/dashboard/turbositter", icon: ScanEye },
];

const settingsItems: NavItem[] = [
  { title: "General Settings", url: "/dashboard/settings", icon: Settings },
];

export function AppSidebar() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role ?? "user";
  const login = ((session?.user as any)?.login || "").toLowerCase();
  const isAdmin = role === "admin" || login === "gram012";

  const filteredNav = useMemo(
    () => navigationItems.filter((i) => !(i.title === "BitWarden" && !isAdmin)),
    [isAdmin]
  );

  const displayName =
    session?.user?.name || (session?.user as any)?.login || "User";
  const avatar = (session?.user as any)?.image ?? "/placeholder-user.jpg";

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center space-x-2 px-2 py-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center">
            <img src="/turboIconB.png" alt="TURBO Logo" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            <Link href="/">TURBO Telescope</Link>
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.external ? (
                    <SidebarMenuButton asChild>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  ) : (
                    <SidebarMenuButton asChild>
                      <Link href={item.url}>
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup> */}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={avatar} />
                    <AvatarFallback>
                      {(displayName || "U")
                        .split(" ")
                        .map((n: any[]) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span>{displayName}</span>
                  <ChevronUp className="ml-auto w-4 h-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top">
                <DropdownMenuItem>
                  <span>Account Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Billing</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
