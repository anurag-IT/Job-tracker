"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { JOB_TYPE_LABEL, STATUS_LABEL } from "@/lib/labels";
import {
  CreateApplicationInput,
  JOB_TYPES,
  STATUSES,
  createApplicationSchema,
} from "@/lib/validation";

type FieldErrors = Partial<Record<keyof CreateApplicationInput, string>>;

type Props = {
  mode: "create" | "edit";
  initial?: Partial<CreateApplicationInput> & { id?: string };
};

const EMPTY: CreateApplicationInput = {
  companyName: "",
  jobTitle: "",
  jobType: "INTERNSHIP",
  status: "APPLIED",
  appliedDate: new Date().toISOString().slice(0, 10),
  notes: undefined,
};

export function ApplicationForm({ mode, initial }: Props) {
  const router = useRouter();
  const [values, setValues] = useState<CreateApplicationInput>({
    ...EMPTY,
    ...initial,
    notes: initial?.notes ?? undefined,
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  function update<K extends keyof CreateApplicationInput>(
    key: K,
    value: CreateApplicationInput[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(null);

    const parsed = createApplicationSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const next: FieldErrors = {};
      for (const k of Object.keys(fieldErrors) as (keyof CreateApplicationInput)[]) {
        const list = fieldErrors[k];
        if (list && list.length > 0) next[k] = list[0];
      }
      setErrors(next);
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      const url =
        mode === "create"
          ? "/api/applications"
          : `/api/applications/${initial?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (!res.ok) {
        const data: unknown = await res.json().catch(() => ({}));
        const msg =
          typeof data === "object" && data && "error" in data
            ? String((data as { error: unknown }).error)
            : "Failed to save";
        throw new Error(msg);
      }
      router.push("/");
      router.refresh();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
      {serverError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <Field label="Company name" error={errors.companyName} htmlFor="companyName">
        <input
          id="companyName"
          type="text"
          className={inputCls(errors.companyName)}
          value={values.companyName}
          onChange={(e) => update("companyName", e.target.value)}
          required
        />
      </Field>

      <Field label="Job title" error={errors.jobTitle} htmlFor="jobTitle">
        <input
          id="jobTitle"
          type="text"
          className={inputCls(errors.jobTitle)}
          value={values.jobTitle}
          onChange={(e) => update("jobTitle", e.target.value)}
          required
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Job type" error={errors.jobType} htmlFor="jobType">
          <select
            id="jobType"
            className={inputCls(errors.jobType)}
            value={values.jobType}
            onChange={(e) =>
              update("jobType", e.target.value as CreateApplicationInput["jobType"])
            }
          >
            {JOB_TYPES.map((t) => (
              <option key={t} value={t}>
                {JOB_TYPE_LABEL[t]}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Status" error={errors.status} htmlFor="status">
          <select
            id="status"
            className={inputCls(errors.status)}
            value={values.status}
            onChange={(e) =>
              update("status", e.target.value as CreateApplicationInput["status"])
            }
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Applied date" error={errors.appliedDate} htmlFor="appliedDate">
        <input
          id="appliedDate"
          type="date"
          className={inputCls(errors.appliedDate)}
          value={values.appliedDate}
          onChange={(e) => update("appliedDate", e.target.value)}
          required
        />
      </Field>

      <Field label="Notes (optional)" error={errors.notes} htmlFor="notes">
        <textarea
          id="notes"
          rows={4}
          className={inputCls(errors.notes)}
          value={values.notes ?? ""}
          onChange={(e) => update("notes", e.target.value === "" ? undefined : e.target.value)}
        />
      </Field>

      <div className="flex items-center justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          disabled={submitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60"
          disabled={submitting}
        >
          {submitting ? "Saving…" : mode === "create" ? "Create" : "Save changes"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="mt-1">{children}</div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function inputCls(hasError?: string) {
  return [
    "block w-full rounded-md border bg-white px-3 py-2 text-sm shadow-sm",
    "focus:outline-none focus:ring-2",
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-red-200"
      : "border-gray-300 focus:border-gray-500 focus:ring-gray-200",
  ].join(" ");
}
