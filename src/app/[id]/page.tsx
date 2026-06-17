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
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
          ← Back to list
        </Link>
        <div className="mt-1 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{application.companyName}</h1>
            <p className="text-gray-600">{application.jobTitle}</p>
          </div>
          <Link
            href={`/${application.id}/edit`}
            className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800"
          >
            Edit
          </Link>
        </div>
      </div>

      <dl className="grid gap-4 rounded-lg border bg-white p-6 shadow-sm sm:grid-cols-2">
        <Detail label="Status">
          <StatusBadge status={application.status} />
        </Detail>
        <Detail label="Job type">{JOB_TYPE_LABEL[application.jobType]}</Detail>
        <Detail label="Applied date">{formatDate(application.appliedDate)}</Detail>
        <Detail label="Last updated">{formatDate(application.updatedAt)}</Detail>
        <div className="sm:col-span-2">
          <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Notes
          </dt>
          <dd className="mt-1 whitespace-pre-wrap text-sm text-gray-800">
            {application.notes && application.notes.trim() !== "" ? (
              application.notes
            ) : (
              <span className="text-gray-400">No notes.</span>
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
      <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-gray-800">{children}</dd>
    </div>
  );
}
