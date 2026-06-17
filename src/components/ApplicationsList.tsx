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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1 rounded-md border bg-white p-1">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={`rounded px-3 py-1 text-sm font-medium transition ${
                filter === f.value
                  ? "bg-gray-900 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <input
          type="search"
          placeholder="Search company or title…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200 sm:w-72"
        />
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
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
    <div className="rounded-lg border border-dashed bg-white py-12 text-center">
      <p className="text-sm text-gray-600">No applications yet.</p>
      <Link
        href="/new"
        className="mt-3 inline-flex items-center rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800"
      >
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
    <div className="hidden overflow-hidden rounded-lg border bg-white shadow-sm md:block">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
          <tr>
            <th className="px-4 py-2.5">Company</th>
            <th className="px-4 py-2.5">Job title</th>
            <th className="px-4 py-2.5">Status</th>
            <th className="px-4 py-2.5">Type</th>
            <th className="px-4 py-2.5">Applied</th>
            <th className="px-4 py-2.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.map((a) => (
            <tr key={a.id}>
              <td className="px-4 py-2.5 font-medium text-gray-900">{a.companyName}</td>
              <td className="px-4 py-2.5 text-gray-700">{a.jobTitle}</td>
              <td className="px-4 py-2.5">
                <StatusBadge status={a.status} />
              </td>
              <td className="px-4 py-2.5 text-gray-700">{JOB_TYPE_LABEL[a.jobType]}</td>
              <td className="px-4 py-2.5 text-gray-700">{formatDate(a.appliedDate)}</td>
              <td className="px-4 py-2.5 text-right">
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
        <li key={a.id} className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <div className="font-medium text-gray-900">{a.companyName}</div>
              <div className="text-sm text-gray-600">{a.jobTitle}</div>
            </div>
            <StatusBadge status={a.status} />
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {JOB_TYPE_LABEL[a.jobType]} · Applied {formatDate(a.appliedDate)}
          </div>
          <div className="mt-3 flex justify-end gap-1">
            <RowActions id={a.id} onDelete={() => onDelete(a)} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function RowActions({ id, onDelete }: { id: string; onDelete: () => void }) {
  const btn =
    "inline-flex items-center rounded-md border border-gray-300 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50";
  return (
    <div className="inline-flex gap-1">
      <Link href={`/${id}`} className={btn}>
        View
      </Link>
      <Link href={`/${id}/edit`} className={btn}>
        Edit
      </Link>
      <button
        type="button"
        onClick={onDelete}
        className="inline-flex items-center rounded-md border border-red-200 bg-white px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
      >
        Delete
      </button>
    </div>
  );
}
