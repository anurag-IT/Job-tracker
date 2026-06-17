"use client";

import { useCallback, useState } from "react";
import { ApplicationsList } from "@/components/ApplicationsList";
import { StatsCards } from "@/components/StatsCards";

export function HomeView() {
  const [reloadKey, setReloadKey] = useState(0);
  const onMutate = useCallback(() => setReloadKey((k) => k + 1), []);

  return (
    <div className="space-y-5">
      <StatsCards reloadKey={reloadKey} />
      <ApplicationsList onMutate={onMutate} />
    </div>
  );
}
