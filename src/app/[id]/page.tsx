import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/StatusBadge";
import { JOB_TYPE_LABEL } from "@/lib/labels";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ApplicationDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const application = await prisma.application.findUnique({
    where: { id: params.id },
  });

  if (!application) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      {/* Breadcrumb + heading row */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          Back to list
        </Link>

        <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 break-words">
              {application.companyName}
            </h1>
            <p className="mt-0.5 text-gray-500 break-words">{application.jobTitle}</p>
          </div>
          <Link
            href={`/${application.id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 active:bg-gray-800 transition-colors shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Edit
          </Link>
        </div>
      </div>

      {/* Detail grid */}
      <dl className="grid gap-5 rounded-2xl border bg-white p-5 sm:p-7 shadow-sm sm:grid-cols-2">
        <Detail label="Status">
          <StatusBadge status={application.status} />
        </Detail>
        <Detail label="Job type">{JOB_TYPE_LABEL[application.jobType]}</Detail>
        <Detail label="Applied date">{formatDate(application.appliedDate)}</Detail>
        <Detail label="Last updated">{formatDate(application.updatedAt)}</Detail>
        <div className="sm:col-span-2">
          <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Notes
          </dt>
          <dd className="mt-2 whitespace-pre-wrap text-sm text-gray-800 leading-relaxed">
            {application.notes && application.notes.trim() !== "" ? (
              application.notes
            ) : (
              <span className="text-gray-400 italic">No notes added.</span>
            )}
          </dd>
        </div>
      </dl>
    </div>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">
        {label}
      </dt>
      <dd className="mt-1.5 text-sm text-gray-800">{children}</dd>
    </div>
  );
}
