import Link from "next/link";
import { ApplicationForm } from "@/components/ApplicationForm";

export default function NewApplicationPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
          ← Back to list
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">New application</h1>
      </div>
      <ApplicationForm mode="create" />
    </div>
  );
}
