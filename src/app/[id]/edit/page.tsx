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
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <Link href={`/${application.id}`} className="text-sm text-gray-500 hover:text-gray-700">
          ← Back to application
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">Edit application</h1>
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
