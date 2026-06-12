"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  Trophy,
  Activity,
  ScrollText,
  Settings,
  Radar,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/discovered", label: "Discovered", icon: Search },
  { href: "/ranked", label: "Top Ranked", icon: Trophy },
  { href: "/agents", label: "Agent Activity", icon: Activity },
  { href: "/logs", label: "Logs", icon: ScrollText },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-border/50 bg-card/50 backdrop-blur-xl">
      <div className="flex items-center gap-3 border-b border-border/50 px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-scout-cyan/20">
          <Radar className="h-5 w-5 text-scout-cyan" />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-tight">Startup Scout</h1>
          <p className="text-xs text-muted-foreground">Autonomous AI</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-scout-cyan/10 text-scout-cyan"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border/50 p-4">
        <div className="rounded-lg bg-scout-purple/10 p-3">
          <p className="text-xs font-medium text-scout-purple">Agent Status</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-scout-green opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-scout-green" />
            </span>
            <span className="text-xs text-muted-foreground">4 agents active</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
