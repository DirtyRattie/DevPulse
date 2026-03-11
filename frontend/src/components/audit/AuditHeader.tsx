interface AuditHeaderProps {
  date: string;
  onDateChange: (date: string) => void;
}

export function AuditHeader({ date, onDateChange }: AuditHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-lg font-semibold text-slate-100">Audit Log</h1>
      <input
        type="date"
        value={date}
        onChange={(e) => onDateChange(e.target.value)}
        className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-300 outline-none focus:border-indigo-500"
      />
    </div>
  );
}
