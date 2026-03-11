import { cn } from "@/lib/utils";

const TABS = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "submitted", label: "Submitted" },
];

interface StatusFilterTabsProps {
  value: string;
  onChange: (value: string) => void;
}

export function StatusFilterTabs({ value, onChange }: StatusFilterTabsProps) {
  return (
    <div className="flex gap-1 rounded-lg border border-slate-800 bg-slate-900 p-1">
      {TABS.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            value === tab.value
              ? "bg-slate-800 text-slate-200"
              : "text-slate-500 hover:text-slate-400"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
