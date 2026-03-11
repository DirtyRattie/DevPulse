import { useState } from "react";
import { useAuditLog } from "@/hooks/use-audit";
import { AuditHeader } from "@/components/audit/AuditHeader";
import { AuditTable } from "@/components/audit/AuditTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorCard } from "@/components/shared/ErrorCard";
import { ClipboardList } from "lucide-react";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function AuditPage() {
  const [date, setDate] = useState(todayStr);
  const { data: entries, isLoading, error } = useAuditLog(date);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <AuditHeader date={date} onDateChange={setDate} />

      {error && <ErrorCard message={String(error)} />}

      {!isLoading && entries?.length === 0 && (
        <EmptyState icon={ClipboardList} message="No audit entries for this date." />
      )}

      {(entries?.length ?? 0) > 0 && (
        <AuditTable entries={entries || []} isLoading={isLoading} />
      )}

      {isLoading && <AuditTable entries={[]} isLoading />}
    </div>
  );
}
