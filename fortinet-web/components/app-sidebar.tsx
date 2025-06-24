"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export function AppSidebar() {
  const pathname = usePathname();

  const routes = [
    {
      name: "Home",
      path: "/",
    },
    {
      name: "Firewalls",
      path: "/firewalls",
    },
    {
      name: "Vdoms",
      path: "/vdoms",
    },
    {
      name: "Routes",
      path: "/routes",
    },
    {
      name: "Interfaces",
      path: "/interfaces",
    },
    {
      name: "Vips",
      path: "/vips",
    },
    {
      name: "Search IPs",
      path: "/search-ips",
    },
  ];

  return (
    <div className="w-64 border-r bg-background h-screen">
      <div className="h-16 flex items-center px-4 border-b">
        <Link href="/" className="font-semibold text-lg">
          Fortinet Network Visualizer
        </Link>
      </div>
      <ScrollArea className="h-[calc(100vh-4rem)]">
        <nav className="p-2 space-y-2">
          {routes.map((route) => (
            <Link
              key={route.path}
              href={route.path}
              className="block"
            >
              <Button
                variant={pathname === route.path ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  pathname === route.path && "font-medium"
                )}
              >
                {route.name}
              </Button>
            </Link>
          ))}
        </nav>
      </ScrollArea>
    </div>
  );
}
