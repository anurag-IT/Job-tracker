import Link from "next/link";
import { ApplicationForm } from "@/components/ApplicationForm";

export default function NewApplicationPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-5">
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
        <h1 className="mt-2 text-xl sm:text-2xl font-semibold text-gray-900">
          New application
        </h1>
        <p className="mt-0.5 text-sm text-gray-500">Fill in the details below to track a new job application.</p>
      </div>
      <ApplicationForm mode="create" />
    </div>
  );
}
