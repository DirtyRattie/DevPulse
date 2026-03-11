import { useState } from "react";
import {
  LayoutDashboard,
  TrendingUp,
  FileText,
  PenSquare,
  ClipboardList,
  PanelLeftClose,
  PanelLeft,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NavItem } from "./NavItem";
import { useHealth } from "@/hooks/use-health";

const NAV_GROUPS = [
  {
    label: "Intelligence",
    items: [
      { to: "/", icon: LayoutDashboard, label: "Dashboard" },
      { to: "/trends", icon: TrendingUp, label: "Trends" },
      { to: "/posts", icon: FileText, label: "Posts" },
    ],
  },
  {
    label: "Operations",
    items: [
      { to: "/drafts", icon: PenSquare, label: "Drafts" },
      { to: "/audit", icon: ClipboardList, label: "Audit" },
    ],
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { data: health } = useHealth();
  const isHealthy = health?.status === "ok";

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-slate-800 bg-slate-950 transition-all duration-200",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-500" />
            <span className="text-sm font-semibold tracking-tight">DevPulse</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
        >
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-slate-500">
                {group.label}
              </p>
            )}
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavItem key={item.to} {...item} collapsed={collapsed} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-800 px-4 py-3">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              isHealthy ? "bg-emerald-500" : "bg-rose-500"
            )}
          />
          {!collapsed && (
            <span className="font-mono text-xs text-slate-500">
              {health?.version || "..."}
            </span>
          )}
        </div>
      </div>
    </aside>
  );
}
