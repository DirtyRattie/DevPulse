import { useState } from "react";
import { Menu, X, Activity } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { to: "/", label: "Dashboard" },
  { to: "/trends", label: "Trends" },
  { to: "/posts", label: "Posts" },
  { to: "/drafts", label: "Drafts" },
  { to: "/audit", label: "Audit" },
];

export function TopBar() {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-slate-800 bg-slate-950 md:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-indigo-500" />
          <span className="text-sm font-semibold">DevPulse</span>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="rounded-md p-1 text-slate-400 hover:text-slate-200"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <nav className="space-y-1 px-3 pb-3">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  "block rounded-lg px-3 py-2 text-sm",
                  isActive
                    ? "bg-indigo-500/15 text-indigo-400"
                    : "text-slate-400 hover:bg-slate-800"
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  );
}
