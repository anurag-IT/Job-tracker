import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ApplicationForm } from "@/components/ApplicationForm";
import { toDateInputValue } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function EditApplicationPage({
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
      <div>
        <Link
          href={`/${application.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          Back to application
        </Link>
        <h1 className="mt-2 text-xl sm:text-2xl font-semibold text-gray-900">
          Edit application
        </h1>
        <p className="mt-0.5 text-sm text-gray-500">
          {application.companyName} — {application.jobTitle}
        </p>
      </div>
      <ApplicationForm
        mode="edit"
        initial={{
          id: application.id,
          companyName: application.companyName,
          jobTitle: application.jobTitle,
          jobType: application.jobType,
          status: application.status,
          appliedDate: toDateInputValue(application.appliedDate),
          notes: application.notes ?? undefined,
        }}
      />
    </div>
  );
}
