import { ApplicationsList } from "@/components/ApplicationsList";

export default function HomePage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Applications</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track companies you&apos;ve applied to and where each application stands.
        </p>
      </div>
      <ApplicationsList />
    </div>
  );
}
