"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "jt:toast";
const EVENT_NAME = "jt:toast";

type ToastKind = "success" | "error";
type ToastPayload = { kind: ToastKind; message: string };

export function flashToast(kind: ToastKind, message: string) {
  if (typeof window === "undefined") return;
  const payload: ToastPayload = { kind, message };
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // sessionStorage unavailable — fall through to event
  }
  window.dispatchEvent(new CustomEvent<ToastPayload>(EVENT_NAME, { detail: payload }));
}

export function Toast() {
  const [toast, setToast] = useState<ToastPayload | null>(null);

  useEffect(() => {
    let dismiss: ReturnType<typeof setTimeout> | undefined;

    function show(payload: ToastPayload) {
      setToast(payload);
      if (dismiss) clearTimeout(dismiss);
      dismiss = setTimeout(() => setToast(null), 3500);
    }

    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        sessionStorage.removeItem(STORAGE_KEY);
        show(JSON.parse(raw) as ToastPayload);
      }
    } catch {
      // ignore malformed payload
    }

    const onToast = (e: Event) => {
      const detail = (e as CustomEvent<ToastPayload>).detail;
      if (detail) {
        try {
          sessionStorage.removeItem(STORAGE_KEY);
        } catch {
          // ignore
        }
        show(detail);
      }
    };
    window.addEventListener(EVENT_NAME, onToast);
    return () => {
      window.removeEventListener(EVENT_NAME, onToast);
      if (dismiss) clearTimeout(dismiss);
    };
  }, []);

  if (!toast) return null;

  const styles =
    toast.kind === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : "border-red-200 bg-red-50 text-red-800";

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border px-4 py-2.5 text-sm shadow-lg ${styles}`}
    >
      <div className="flex items-center gap-2">
        {toast.kind === "success" ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        )}
        <span className="font-medium">{toast.message}</span>
      </div>
    </div>
  );
}
