export function Spinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div
      role="status"
      aria-label={label}
      className="flex flex-col items-center justify-center gap-3 py-16 text-gray-400"
    >
      <span
        className="inline-block h-8 w-8 animate-spin rounded-full border-[3px] border-gray-200 border-t-gray-600"
        aria-hidden
      />
      <span className="text-sm">{label}</span>
    </div>
  );
}
