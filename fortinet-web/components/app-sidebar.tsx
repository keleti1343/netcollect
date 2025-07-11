"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Home, HardDrive, LayoutDashboard, GitPullRequest, Network, Shield, Search } from "lucide-react";

export function AppSidebar() {
  const pathname = usePathname();

  const routes = [
    {
      name: "Home",
      path: "/",
      icon: Home,
    },
    {
      name: "Firewalls",
      path: "/firewalls",
      icon: HardDrive,
    },
    {
      name: "VDOMs",
      path: "/vdoms",
      icon: LayoutDashboard,
    },
    {
      name: "Routes",
      path: "/routes",
      icon: GitPullRequest,
    },
    {
      name: "Interfaces",
      path: "/interfaces",
      icon: Network,
    },
    {
      name: "VIPs",
      path: "/vips",
      icon: Shield,
    },
    {
      name: "Search IPs",
      path: "/search-ips",
      icon: Search,
    },
  ];

  return (
    <div className="w-64 h-screen flex flex-col bg-gradient-to-b from-[var(--sidebar-bg-start)] to-[var(--sidebar-bg-end)] shadow-[var(--sidebar-shadow)]">
      <div className="h-16 flex items-center px-4 border-b border-gray-800">
        <Link href="/" className="font-semibold text-sm text-white whitespace-nowrap overflow-hidden text-ellipsis">
          Fortinet Network Visualizer
        </Link>
      </div>
      <ScrollArea className="flex-grow">
        <nav className="p-4 space-y-1">
          {routes.map((route) => {
            const Icon = route.icon;
            return (
              <Link
                key={route.path}
                href={route.path}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
                  pathname === route.path
                    ? "border-l-[var(--sidebar-active-border-left)] bg-gradient-to-r from-[var(--sidebar-active-bg-start)] to-[var(--sidebar-active-bg-end)] text-primary-foreground"
                    : "text-[var(--sidebar-inactive-text)] hover:bg-[var(--sidebar-inactive-hover-bg)] hover:text-[var(--sidebar-inactive-hover-text)]"
                )}
              >
                {Icon && <Icon className="h-5 w-5" />}
                {route.name}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
    </div>
  );
}
