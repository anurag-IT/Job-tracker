"use client";

import { useEffect, useState } from "react";
import { STATUSES, type Status } from "@/lib/validation";
import { STATUS_LABEL } from "@/lib/labels";

type Stats = {
  total: number;
  byStatus: Record<Status, number>;
};

const ACCENT: Record<Status, string> = {
  APPLIED: "bg-blue-500",
  INTERVIEWING: "bg-amber-400",
  OFFER: "bg-emerald-500",
  REJECTED: "bg-red-500",
};

export function StatsCards({ reloadKey }: { reloadKey: number }) {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/applications/stats", { cache: "no-store" });
        if (!res.ok) return;
        const data: Stats = await res.json();
        if (!cancelled) setStats(data);
      } catch {
        // stats are best-effort — failure shouldn't break the page
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      <Card label="Total" value={stats?.total ?? null} accent="bg-gray-900" />
      {STATUSES.map((s) => (
        <Card
          key={s}
          label={STATUS_LABEL[s]}
          value={stats?.byStatus[s] ?? null}
          accent={ACCENT[s]}
        />
      ))}
    </div>
  );
}

function Card({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | null;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <span className={`inline-block h-2 w-2 rounded-full ${accent}`} aria-hidden="true" />
        <p className="text-xs font-medium uppercase tracking-wider text-gray-500">{label}</p>
      </div>
      <p className="mt-2 text-2xl font-semibold text-gray-900 tabular-nums">
        {value === null ? "—" : value}
      </p>
    </div>
  );
}
