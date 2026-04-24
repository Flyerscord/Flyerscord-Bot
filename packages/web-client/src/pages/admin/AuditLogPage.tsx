import { useState } from "react";
import { trpc } from "../../trpc";

const SEVERITY_COLORS: Record<string, string> = {
  INFO: "badge-info",
  WARNING: "badge-warning",
  ERROR: "badge-error",
  CRITICAL: "badge-error",
};

export default function AuditLogPage() {
  const [page, setPage] = useState(1);
  const [moduleFilter, setModuleFilter] = useState("");

  const { data, isLoading, error } = trpc.auditLog.list.useQuery({
    page,
    module: moduleFilter || undefined,
  });

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 0;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Audit Log</h1>

      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Filter by module..."
          className="input input-bordered input-sm w-48"
          value={moduleFilter}
          onChange={(e) => {
            setModuleFilter(e.target.value);
            setPage(1);
          }}
        />
        <span className="text-base-content/50 self-center text-sm">{data ? `${data.total.toLocaleString()} entries` : ""}</span>
      </div>

      {isLoading && (
        <div className="flex justify-center py-20">
          <span className="loading loading-spinner loading-lg" />
        </div>
      )}

      {error && <div className="alert alert-error">Failed to load audit log.</div>}

      {data && (
        <>
          <div className="overflow-x-auto">
            <table className="table table-zebra table-sm w-full">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Module</th>
                  <th>Action</th>
                  <th>Severity</th>
                  <th>User</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {data.entries.map((entry) => (
                  <tr key={entry.id}>
                    <td className="whitespace-nowrap text-xs text-base-content/70">
                      {new Date(entry.timestamp).toLocaleString()}
                    </td>
                    <td>
                      <div className="badge badge-ghost badge-sm">{entry.moduleName}</div>
                    </td>
                    <td className="font-mono text-sm">{entry.action}</td>
                    <td>
                      <div className={`badge badge-sm ${SEVERITY_COLORS[entry.severity] ?? "badge-ghost"}`}>{entry.severity}</div>
                    </td>
                    <td className="text-xs text-base-content/70">{entry.userId ?? "—"}</td>
                    <td className="max-w-xs truncate text-xs text-base-content/70">
                      {entry.details ? JSON.stringify(entry.details) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button className="btn btn-sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                «
              </button>
              <span className="btn btn-sm btn-disabled">
                {page} / {totalPages}
              </span>
              <button className="btn btn-sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                »
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
