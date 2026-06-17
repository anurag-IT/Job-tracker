"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Spinner } from "@/components/Spinner";
import { StatusBadge } from "@/components/StatusBadge";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { JOB_TYPE_LABEL, STATUS_LABEL } from "@/lib/labels";
import { formatDate } from "@/lib/format";
import type { Application } from "@/lib/types";
import { STATUSES, Status } from "@/lib/validation";

type Filter = "ALL" | Status;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "ALL", label: "All" },
  ...STATUSES.map((s) => ({ value: s as Filter, label: STATUS_LABEL[s] })),
];

export function ApplicationsList() {
  const [filter, setFilter] = useState<Filter>("ALL");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [items, setItems] = useState<Application[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [toDelete, setToDelete] = useState<Application | null>(null);
  const [deleting, setDeleting] = useState(false);
  const reqId = useRef(0);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const load = useCallback(async () => {
    const myId = ++reqId.current;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filter !== "ALL") params.set("status", filter);
      if (debouncedSearch) params.set("search", debouncedSearch);
      const qs = params.toString();
      const res = await fetch(`/api/applications${qs ? `?${qs}` : ""}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to load applications");
      const data: Application[] = await res.json();
      if (reqId.current === myId) setItems(data);
    } catch (err) {
      if (reqId.current === myId) {
        setError(err instanceof Error ? err.message : "Failed to load");
        setItems([]);
      }
    } finally {
      if (reqId.current === myId) setLoading(false);
    }
  }, [filter, debouncedSearch]);

  useEffect(() => {
    void load();
  }, [load]);

  const onConfirmDelete = useCallback(async () => {
    if (!toDelete || !items) return;
    const target = toDelete;
    const prev = items;
    setItems(items.filter((a) => a.id !== target.id));
    setDeleting(true);
    try {
      const res = await fetch(`/api/applications/${target.id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) {
        throw new Error("Failed to delete");
      }
      setToDelete(null);
    } catch (err) {
      setItems(prev);
      setError(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeleting(false);
    }
  }, [toDelete, items]);

  const empty = useMemo(
    () => !loading && items !== null && items.length === 0,
    [loading, items],
  );

  return (
    <div className="space-y-4">
      {/* Toolbar: filter pills + search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Filter pills — horizontally scrollable on mobile */}
        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex gap-1.5 rounded-xl border bg-white p-1.5 w-max sm:w-auto shadow-sm">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFilter(f.value)}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium transition-all ${
                  filter === f.value
                    ? "bg-gray-900 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search — full width on mobile, fixed on sm+ */}
        <div className="relative w-full sm:w-72">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="search"
            placeholder="Search company or title…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white pl-9 pr-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </div>
      )}

      {loading && items === null ? (
        <Spinner />
      ) : empty ? (
        <EmptyState />
      ) : (
        <>
          <DesktopTable items={items ?? []} onDelete={setToDelete} />
          <MobileCards items={items ?? []} onDelete={setToDelete} />
        </>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title="Delete application?"
        description={
          toDelete
            ? `This will permanently remove ${toDelete.companyName} — ${toDelete.jobTitle}.`
            : undefined
        }
        confirmLabel="Delete"
        busy={deleting}
        onConfirm={onConfirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white py-16 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400" aria-hidden="true">
          <rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
        </svg>
      </div>
      <p className="text-sm font-medium text-gray-900">No applications yet</p>
      <p className="mt-1 text-sm text-gray-500">Start tracking your job search journey.</p>
      <Link
        href="/new"
        className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        Add your first application
      </Link>
    </div>
  );
}

function DesktopTable({
  items,
  onDelete,
}: {
  items: Application[];
  onDelete: (a: Application) => void;
}) {
  return (
    <div className="hidden overflow-hidden rounded-2xl border bg-white shadow-sm md:block">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
          <tr>
            <th className="px-5 py-3">Company</th>
            <th className="px-5 py-3">Job title</th>
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3">Type</th>
            <th className="px-5 py-3">Applied</th>
            <th className="px-5 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.map((a) => (
            <tr key={a.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-5 py-3.5 font-medium text-gray-900">{a.companyName}</td>
              <td className="px-5 py-3.5 text-gray-600">{a.jobTitle}</td>
              <td className="px-5 py-3.5">
                <StatusBadge status={a.status} />
              </td>
              <td className="px-5 py-3.5 text-gray-600">{JOB_TYPE_LABEL[a.jobType]}</td>
              <td className="px-5 py-3.5 text-gray-600">{formatDate(a.appliedDate)}</td>
              <td className="px-5 py-3.5 text-right">
                <RowActions id={a.id} onDelete={() => onDelete(a)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MobileCards({
  items,
  onDelete,
}: {
  items: Application[];
  onDelete: (a: Application) => void;
}) {
  return (
    <ul className="space-y-3 md:hidden">
      {items.map((a) => (
        <li key={a.id} className="rounded-2xl border bg-white p-4 shadow-sm">
          {/* Company + status row */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-semibold text-gray-900">{a.companyName}</p>
              <p className="mt-0.5 truncate text-sm text-gray-500">{a.jobTitle}</p>
            </div>
            <StatusBadge status={a.status} />
          </div>
          {/* Meta row */}
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              </svg>
              {JOB_TYPE_LABEL[a.jobType]}
            </span>
            <span className="inline-flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Applied {formatDate(a.appliedDate)}
            </span>
          </div>
          {/* Actions row */}
          <div className="mt-3 flex gap-2 border-t border-gray-100 pt-3">
            <RowActions id={a.id} onDelete={() => onDelete(a)} fullWidth />
          </div>
        </li>
      ))}
    </ul>
  );
}

function RowActions({
  id,
  onDelete,
  fullWidth = false,
}: {
  id: string;
  onDelete: () => void;
  fullWidth?: boolean;
}) {
  const base =
    "inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100 transition-colors";
  const widthCls = fullWidth ? "flex-1" : "";
  return (
    <div className={`flex gap-2 ${fullWidth ? "w-full" : ""}`}>
      <Link href={`/${id}`} className={`${base} ${widthCls}`}>
        View
      </Link>
      <Link href={`/${id}/edit`} className={`${base} ${widthCls}`}>
        Edit
      </Link>
      <button
        type="button"
        onClick={onDelete}
        className={`inline-flex items-center justify-center rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 hover:border-red-300 active:bg-red-100 transition-colors ${widthCls}`}
      >
        Delete
      </button>
    </div>
  );
}
